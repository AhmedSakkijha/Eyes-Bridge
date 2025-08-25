import apache_beam as beam
from apache_beam.options.pipeline_options import PipelineOptions
from apache_beam.io.gcp.pubsub import ReadFromPubSub, WriteToPubSub
from google.cloud import videointelligence_v1 as videointelligence
from google.cloud import aiplatform
import json
import time
from google.api_core import retry
import google.api_core.exceptions
import asyncio

class AnalyzeVideo(beam.DoFn):
    def __init__(self):
        self.buffer = []
        self.last_process_time = time.time()
        self.buffer_size = 10  
        self.process_interval = 60 

    def setup(self):
        self.video_client = videointelligence.VideoIntelligenceServiceClient()
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)

    @retry.Retry(predicate=retry.if_exception_type(google.api_core.exceptions.ResourceExhausted))
    async def process_video_async(self, video):
        features = [videointelligence.Feature.OBJECT_TRACKING, videointelligence.Feature.PERSON_DETECTION]
        operation = self.video_client.annotate_video(request={"features": features, "input_content": video})
        return await operation.result(timeout=120)

    async def process_videos_async(self, videos):
        tasks = [self.process_video_async(video) for video in videos]
        return await asyncio.gather(*tasks, return_exceptions=True)

    def process(self, element):
        from google.cloud import aiplatform
        aiplatform.init(project='Eyesbridge', location='asia-northwest1')

        self.buffer.append(element)

        current_time = time.time()
        if len(self.buffer) >= self.buffer_size or (current_time - self.last_process_time) >= self.process_interval:
            results = self.loop.run_until_complete(self.process_videos_async(self.buffer))
            processed_results = []

            for result in results:
                if isinstance(result, Exception):
                    print(f"Error processing video: {result}")
                    continue

                objects = []
                for annotation in result.annotation_results[0].object_annotations:
                    objects.append({
                        'entity': annotation.entity.description,
                        'confidence': annotation.confidence,
                        'frames': [
                            {
                                'time_offset': frame.time_offset.total_seconds(),
                                'normalized_bounding_box': {
                                    'left': frame.normalized_bounding_box.left,
                                    'top': frame.normalized_bounding_box.top,
                                    'right': frame.normalized_bounding_box.right,
                                    'bottom': frame.normalized_bounding_box.bottom
                                }
                            } for frame in annotation.frames
                        ]
                    })
                processed_results.append(objects)

            if processed_results:
                prompt = self.create_prompt_for_video(processed_results)
                model = aiplatform.TextGenerationModel.from_pretrained("gemini-1.5-flash-001")
                response = model.predict(prompt, max_output_tokens=1024, temperature=0.2)
                self.buffer = []
                self.last_process_time = current_time
                return [json.dumps(response.text)]

        return []

    def create_prompt_for_video(self, objects):
        return f"""You are a visual support AI assistant for visually impaired people. Please convert the following video analysis results into concise and clear voice feedback:

1. Prioritize the most important information (safety, movement-related elements) and convey it first.
2. Explain the relative positions and movements of detected objects to help the user understand their spatial awareness.
3. Convey each piece of information in short sentences of 15 characters or less.  
4. Emphasize dangerous situations and obstacles in particular.  
5. Include important visual information such as people, text, and signs.  
6. Specifically describe the direction and speed of moving objects.  
7. Immediately report sudden changes in the scene or important events.  

Translated with DeepL.com (free version)
Detected objects:
{json.dumps(objects, indent=2)}

Follow the instructions above to convert the given video analysis results into real-time audio feedback for the visually impaired. Output the results in bullet points in order of importance."""

def run(argv=None):
    pipeline_options = PipelineOptions(argv, streaming=True, save_main_session=True)
    p = beam.Pipeline(options=pipeline_options)

    (p
     | 'Read from PubSub' >> ReadFromPubSub(subscription='projects/Eyesbridge/subscriptions/Eyesbridge-video-stream-sub')
     | 'Analyze Video' >> beam.ParDo(AnalyzeVideo())
     | 'Write to PubSub' >> WriteToPubSub(topic='projects/Eyesbridge/topics/Eyesbridge-video-analysis-results')
    )

    result = p.run()
    result.wait_until_finish()

if __name__ == '__main__':
    run()