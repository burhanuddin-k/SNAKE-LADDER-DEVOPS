# 🐍 Snake & Ladder Game - CI/CD Pipeline Project

## 📌 Project Overview

This project demonstrates a complete DevOps CI/CD pipeline by deploying a Snake & Ladder web application using GitHub, Jenkins, AWS EC2, and Nginx.

Whenever code is pushed to the GitHub repository, Jenkins automatically detects the changes through a GitHub Webhook, builds the project, and deploys it to the Nginx web server running on an AWS EC2 instance.

---

## 🚀 Project Architecture

```
Developer (VS Code)
        │
        ▼
   Git Commands
(git add, commit, push)
        │
        ▼
 GitHub Repository
        │
 GitHub Webhook
        │
        ▼
 Jenkins Pipeline
        │
 Checkout Source Code
        │
 Build Stage
        │
 Test Stage
        │
 Deploy Stage
        │
        ▼
 /var/www/html
        │
        ▼
     Nginx Server
        │
        ▼
 Live Website
```

---

# 🛠 Technologies Used

- HTML5
- CSS3
- JavaScript
- Git
- GitHub
- Jenkins
- Jenkins Pipeline
- GitHub Webhooks
- AWS EC2 (Ubuntu)
- Nginx
- Linux

---

# 📂 Project Structure

```
SNAKE-LADDER-DEVOPS/
│
├── index.html
├── style.css
├── script.js
├── Jenkinsfile
├── README.md
```

---

# ⚙️ Prerequisites

Before running this project, make sure you have:

- Git installed
- GitHub account
- AWS Account
- EC2 Ubuntu Instance
- Jenkins installed
- Nginx installed
- Java installed

---

# 🔧 Jenkins Pipeline Stages

## 1️⃣ Checkout

- Clone source code from GitHub repository.

## 2️⃣ Build

- Build the web application.

## 3️⃣ Test

- Verify the project.

## 4️⃣ Deploy

- Remove old website files.
- Copy new project files to Nginx directory.

---

# 📜 Sample Jenkinsfile

```groovy
pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo "Building Snake & Ladder Game..."
            }
        }

        stage('Test') {
            steps {
                echo "Running Tests..."
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                sudo rm -rf /var/www/html/*
                sudo cp index.html style.css script.js /var/www/html/
                '''
            }
        }
    }
}
```

---

# ☁ AWS Setup

- Launch Ubuntu EC2 Instance
- Install Java
- Install Jenkins
- Install Git
- Install Nginx
- Configure Security Groups
  - Port 22 (SSH)
  - Port 80 (HTTP)
  - Port 8080 (Jenkins)

---

# 🔗 GitHub Integration

Repository is connected with Jenkins using:

- Git Plugin
- GitHub Credentials
- Pipeline Script from SCM

Repository URL:

```
https://github.com/burhanuddin-k/SNAKE-LADDER-DEVOPS.git
```

---

# 🔔 GitHub Webhook

Webhook URL:

```
http://<EC2-PUBLIC-IP>:8080/github-webhook/
```

Event:

- Push Event

Whenever code is pushed to GitHub, Jenkins automatically starts the pipeline.

---

# 🌐 Deployment

Application is deployed to:

```
/var/www/html
```

Nginx serves the application.

Access using:

```
http://<EC2-PUBLIC-IP>
```

---

# ▶️ How to Run

### Clone Repository

```bash
git clone https://github.com/burhanuddin-k/SNAKE-LADDER-DEVOPS.git
```

### Enter Project

```bash
cd SNAKE-LADDER-DEVOPS
```

### Open

Open `index.html` in your browser.

---

# 🔄 CI/CD Workflow

```
Code Changes
      │
      ▼
Git Push
      │
      ▼
GitHub
      │
      ▼
Webhook Trigger
      │
      ▼
Jenkins Pipeline
      │
      ▼
Checkout
      │
      ▼
Build
      │
      ▼
Test
      │
      ▼
Deploy
      │
      ▼
Nginx
      │
      ▼
Live Website
```

---

# ✨ Features

- Responsive Snake & Ladder Game
- Git Version Control
- Jenkins Declarative Pipeline
- Automatic Deployment
- GitHub Webhook Integration
- AWS EC2 Hosting
- Nginx Web Server
- Continuous Integration
- Continuous Deployment

---

# 🎯 Learning Outcomes

This project helped in understanding:

- Git & GitHub
- Jenkins Installation
- Jenkins Pipeline
- Declarative Pipeline
- Jenkinsfile
- GitHub Webhooks
- AWS EC2
- Nginx Configuration
- Linux Commands
- CI/CD Workflow
- Automated Deployment

---

# 👨‍💻 Author

**Burhanuddin Kuwala**

DevOps & Cloud Computing Learner

GitHub:
https://github.com/burhanuddin-k

---

# ⭐ Future Enhancements

- Docker Containerization
- Kubernetes Deployment
- AWS CodePipeline Integration
- SonarQube Code Analysis
- Slack Notifications
- Email Notifications
- Automated Testing
- Blue-Green Deployment
- Monitoring using CloudWatch
