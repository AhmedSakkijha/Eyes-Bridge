
## 1. Background and Motivation

According to the World Health Organization (WHO), over 2.2 billion people worldwide live with some form of visual impairment. Confronted with this staggering figure, I was deeply moved to reflection. During this time, I had the opportunity to reconnect with a friend who has visual impairments. Hearing about the daily challenges he faces—stopping at intersections because he cannot distinguish traffic light colors, or finding himself in dangerous situations due to unnoticed obstacles—was truly heartbreaking.

Many existing assistive devices and applications for people with visual impairments are either prohibitively expensive, difficult to obtain, or offer limited functionality, failing to provide adequate solutions. As a result, many individuals with visual impairments are unable to benefit from the latest technological advances.

This experience sparked a strong desire to create a **tool that combines cutting-edge AI technology with voice interfaces to serve as the "eyes" for people with visual impairments, bridging their connection** to the world. Thus, the Vision Eyes project was born.

## 2. Project Objectives
Eyes Bridge aims to achieve the following goals:

Improve the quality of life for people with visual impairments and support their independence
Harness the latest AI technology to create an environment where everyone can benefit from technological advances
Promote the democratization of technology and contribute to building a sustainable society

This project also contributes to achieving the Sustainable Development Goals (SDGs):

Good Health and Well-being: Enhancing safety and independence in daily life for people with visual impairments
Industry, Innovation and Infrastructure: Providing innovative solutions through the latest AI technology
Reduced Inequalities: Equalizing access to technology and contributing to bridging the digital divide

## 3. Feature Overview

Eyes Bridge provides the following core functionalities:

**Real-time Environmental Recognition**:

Real-time analysis of surroundings through camera input
Support for both images and videos with immediate audio feedback
Identification of obstacles, people, and textual information to support safe navigation

**Navigation Assistance**:

Voice-guided optimal walking routes to destinations

**Object Recognition**:

High-precision recognition of specific objects and text with detailed audio descriptions
Text-to-speech functionality for product labels, signs, and menus
Audio description of color information

**Voice Command Operation**:

Intuitive operation through advanced speech recognition systems
Voice control for camera activation, analysis start/stop, navigation initiation, and more
Natural language conversational interface

## 4. Technical Implementation

Eyes Bridge development leverages the latest cloud technologies and AI:

**Frontend Development**:

-Cross-platform web application development using React (Next.js)
-UI/UX design prioritizing accessibility
-Multi-language support using i18next

**Backend Construction**:

-Scalable backend construction using Google Cloud Run
-Serverless architecture implementation with Cloud Functions
-Efficient data management using Cloud Storage

**AI Function Integration**:

-High-precision image and video analysis using Google Cloud Vertex AI's latest Gemini model
-Natural voice interaction through Speech-to-Text and Text-to-Speech
-Advanced dialogue system using Dialogflow with generator configurations for flexible response generation

**Navigation Feature Implementation**:

-Accurate location services and route guidance using Google Maps Platform APIs

**CI/CD Pipeline Construction**:

-Automated continuous deployment using Google Cloud Build

## 5. Challenges Faced During Development and Solutions

**Latency Optimization**:

Challenge: Ensuring real-time performance
Solution: Optimizing frequency and timing of API calls

**AI Recognition Accuracy Improvement**:

Challenge: Enhancing recognition accuracy across diverse environments
Solution: Improving prompt engineering techniques

**User Interface Design**:

Challenge: Achieving intuitive operation without relying on vision
Solution: UI/UX optimization, Dialogflow refinement, and implementing workarounds for smartphone browser voice autoplay restrictions

**Navigation Feature Limitations**:

Challenge: Difficulty implementing real-time turn-by-turn navigation in web applications
Solution: Currently providing bulleted directions to destinations, with plans for future native app implementation

**Security and Privacy Assurance**:

Challenge: Ensuring personal information protection and safety
Solution: Designed to store only anonymized voice command text history while maintaining no personal information

## 6. Notable Achievements

**High-Precision Environmental Recognition**: Achieved high-accuracy environmental recognition using the latest AI model (Gemini)
**Seamless Voice Interaction**: Realized natural and smooth conversational interface through Dialogflow and Text-to-Speech integration. By configuring Dialogflow generators and deliberately not setting intents, achieved more accurate understanding of user intentions and flexible natural language operation and dialogue
**User-Centric Design**: User-focused feature development and UI/UX optimization
**Scalable Real-time Processing**: Built scalable, high-performance system architecture leveraging cloud services like Cloud Functions
**Multi-language Support**: Established foundation for international expansion through multi-language support using i18next (internationalization library)

## 7. Lessons Learned

**Real-world AI Application**: Learned effective implementation methods for meeting user needs using Google Cloud AI services
**Accessibility Design**: Understood the importance of UI and UX design tailored to the needs of people with visual impairments
**Multimodal Integration**: Acquired technology for integrating different modalities such as visual, audio, and location information
**Ethical AI Development**: Recognized the importance of AI application development considering privacy and security
**Cloud-Native Development**: Learned scalable application development methods using various Google Cloud Platform services

## 8. Eyes Bridge's Future

**Continuous Machine Learning Model Improvement**: Enhancing AI model accuracy to handle more diverse environments and situations
**Social Feature Addition**: Implementing information sharing and safety confirmation features among people with visual impairments and their families
**Wearable Device Support**: Providing more seamless experiences through integration with smart glasses and other devices
**Multi-language Support Expansion**: Increasing supported languages to enable use in more countries and regions
**Native App Development**: Full utilization of device capabilities through iOS/Android app development
**Real-time Navigation Implementation**: Providing turn-by-turn navigation using Google Maps SDK in native apps
**Open Platform Development**: Providing APIs and SDKs for third-party developers
**Performance Optimization**: Further improving real-time performance through edge computing utilization and algorithm improvements
**User Feedback Integration**: Feature improvements based on actual user feedback

Eyes Bridge aims not only to support the daily lives of people with visual impairments through cutting-edge AI technology but also to realize a society where everyone has equal access to information through technology democratization. Through this project, I aspire to contribute to making the world a more inclusive and equitable place through the power of technology.