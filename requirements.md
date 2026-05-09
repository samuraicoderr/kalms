# Product Requirements Document (PRD)

## Project Title

**Development of an AI-Based Mental Health Support System for University Students**

---

# 1. Introduction

## 1.1 Overview

The AI-Based Mental Health Support System is a web/mobile platform designed to help university students monitor, assess, and improve their mental well-being through clinically recognized assessments, AI-powered analysis, mood tracking, personalized recommendations, and a conversational support companion.

The system aims to provide students with accessible early mental health support while encouraging self-awareness and healthy coping habits.

The platform is not intended to replace professional mental health care, diagnosis, or therapy. Instead, it acts as a supportive wellness tool that helps identify signs of emotional distress and encourages students to seek appropriate support when necessary.

---

# 2. Problem Statement

University students frequently experience:

* academic stress,
* anxiety,
* depression,
* burnout,
* loneliness,
* and emotional instability.

Many students:

* do not seek help early,
* lack awareness of their mental state,
* or do not have easy access to counseling services.

Traditional mental health support systems may also:

* be expensive,
* inaccessible,
* or unavailable at all times.

The proposed platform addresses this problem by providing:

* continuous self-assessment,
* AI-assisted mental health risk analysis,
* emotional tracking,
* and a safe digital support companion.

---

# 3. Goals and Objectives

## 3.1 Primary Goal

To develop an intelligent mental health support platform that helps university students assess and monitor their emotional well-being.

## 3.2 Objectives

The platform should:

* Allow students to create accounts securely.
* Conduct mental health assessments using standard questionnaires.
* Analyze assessment results using a Random Forest machine learning model.
* Categorize users into wellness states such as:

  * Healthy
  * At Risk
  * Distressed
* Provide personalized wellness recommendations.
* Offer a conversational AI companion for emotional support.
* Track emotional trends and mental wellness over time.
* Display visual dashboards and reports.
* Encourage healthy mental habits through daily check-ins.

---

# 4. Target Users

## Primary Users

* University students aged 16–30.

## Secondary Users

* Academic researchers.
* University counseling departments.
* Mental health awareness organizations.

---

# 5. Scope

## In Scope

* User authentication
* Mental health questionnaires
* AI/ML prediction system
* Mood tracking
* Dashboard analytics
* Chat companion
* Historical assessments
* Recommendation engine
* Trend visualization

## Out of Scope

* Clinical diagnosis
* Medical treatment
* Emergency psychiatric intervention
* Medication prescriptions
* Real-time human counseling

---

# 6. Functional Requirements

# 6.1 User Authentication Module

## Features

* Student registration
* Login/logout
* Password reset
* Secure session management

## Inputs

* Name
* Email
* Password
* Institution (optional)

## Outputs

* Authenticated user session

---

# 6.2 Dashboard Module

The dashboard serves as the platform’s main overview screen.

## Features

### Greeting Section

* Time-aware greeting:

  * “Good morning”
  * “Good afternoon”
  * “Good evening”
* Displays student name
* Displays current date

### Daily Motivation

* Rotating motivational quotes/tips

### Daily Check-In

Students can rate:

* Mood (1–10)
* Energy (1–10)
* Stress (1–10)

### Statistics Cards

Display:

* Total assessments taken
* Current streak
* Latest mental health category
* Wellness trend indicator

### Assessment Summary

Shows latest scores for:

* PHQ-9
* GAD-7
* PSS-10

### Trend Visualization

Displays charts showing score progression over time.

### Quick Actions

Buttons for:

* Start Assessment
* Open Chat Companion
* View History
* Mood Tracker

---

# 6.3 Assessment Module

The platform should support standardized mental health questionnaires.

## Supported Assessments

### PHQ-9

Measures depression severity.

### GAD-7

Measures anxiety severity.

### PSS-10

Measures perceived stress levels.

---

## Assessment Workflow

1. Student starts assessment.
2. System presents questionnaire items.
3. Student answers questions.
4. Scores are calculated.
5. AI model analyzes results.
6. System categorizes mental state.
7. Recommendations are generated.

---

## Outputs

* Numerical scores
* Wellness category
* AI prediction result
* Recommendations

---

# 6.4 AI Prediction Module

## Purpose

To analyze questionnaire responses and identify mental wellness risk levels.

## Machine Learning Model

Random Forest Classification Algorithm.

## Inputs

* PHQ-9 score
* GAD-7 score
* PSS-10 score
* Mood tracking data
* Historical trends (optional)

## Output Categories

* Healthy
* At Risk
* Distressed

## Expected Functions

* Predict risk level
* Improve classification accuracy
* Detect worsening trends

---

# 6.5 Recommendation Engine

The platform should generate wellness recommendations based on:

* assessment scores,
* AI predictions,
* and user trends.

## Examples

* relaxation exercises,
* sleep improvement tips,
* breathing techniques,
* study balance suggestions,
* social engagement encouragement,
* recommendation to seek professional help.

---

# 6.6 Chat Companion Module

## Purpose

To provide supportive conversational interaction.

## Chatbot Name

“Kalms” (example)

## Features

* Text-based chat
* Emotional support conversation
* Motivational responses
* Wellness guidance
* Encouragement messages

## Important Restriction

The chatbot must:

* avoid acting as a licensed therapist,
* avoid diagnosing conditions,
* avoid harmful advice,
* encourage professional support when needed.

---

# 6.7 Mood Tracking Module

Students can log:

* mood,
* energy,
* stress,
* and optional journal notes daily.

## Features

* Mood history
* Emotional trend tracking
* Daily streaks
* Progress visualization

---

# 6.8 History Module

Students can view:

* previous assessments,
* past mood logs,
* prediction history,
* and wellness trends.

---

# 7. Non-Functional Requirements

## Performance

* Dashboard should load within 3 seconds.
* Assessment results should generate instantly after submission.

## Security

* Password encryption
* Secure authentication
* Protected user data
* HTTPS communication

## Usability

* Mobile responsive interface
* Simple and accessible UI
* Easy navigation

## Reliability

* Stable uptime
* Consistent data storage

## Scalability

* System should support increasing numbers of users.

---

# 8. System Architecture

## Frontend

Possible technologies:

* React
* Flutter
* HTML/CSS/JavaScript

## Backend

Possible technologies:

* Django
* Node.js
* Flask

## Database

* PostgreSQL
* MySQL
* MongoDB

## Machine Learning

* Python
* Scikit-learn
* Random Forest model

---

# 9. Database Requirements

## Core Tables

### Users

Stores:

* user information
* login credentials

### Assessments

Stores:

* questionnaire responses
* scores
* timestamps

### Mood Logs

Stores:

* daily emotional check-ins

### Predictions

Stores:

* AI prediction outputs

### Chat History

Stores:

* chatbot interactions

---

# 10. User Flow

## New User Flow

1. Register account
2. Login
3. Complete first assessment
4. Receive AI analysis
5. View dashboard
6. Begin mood tracking
7. Interact with chatbot

---

# 11. UI/UX Requirements

## Design Goals

* Calm and welcoming
* Minimalist
* Non-judgmental
* Accessible

## Suggested Colors

* Soft blue
* Green
* White
* Purple accents

## Design Principles

* Simple navigation
* Clear typography
* Emotional comfort
* Mobile-first responsiveness

---

# 12. Success Metrics

The project will be considered successful if:

* students can complete assessments successfully,
* AI predictions work accurately,
* dashboard visualizations function correctly,
* chatbot interactions work smoothly,
* users can track emotional progress over time.

---

# 13. Risks and Limitations

## Risks

* Misclassification of mental states
* User overreliance on chatbot
* Dataset limitations
* Ethical concerns around AI recommendations

## Mitigation

* Clear disclaimers
* Encourage professional support
* Use validated questionnaires
* Restrict chatbot claims

---

# 14. Future Improvements

Potential future features:

* Voice-based chatbot
* Counselor integration
* Community support groups
* Mobile push notifications
* Emotion detection from text
* Wearable device integration

---

# 15. Conclusion

The AI-Based Mental Health Support System aims to provide university students with an accessible digital wellness platform that combines psychological assessments, machine learning, emotional tracking, and conversational support.

The system promotes mental health awareness, early risk identification, and healthy coping habits while maintaining ethical boundaries and encouraging professional assistance when needed.
