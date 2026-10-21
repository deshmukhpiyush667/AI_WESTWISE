# AI WasteWise — AI-Based Waste Classification and Management System

A production-grade, full-stack, AI-driven waste classification and environmental management platform engineered for final-year engineering capstone and academic evaluation.

---

## 🌟 Key Features

1. **AI-Powered Deep Image Classification**:
   - Built on **MobileNetV3 transfer learning** via TensorFlow/Keras with **90.65% held-out test accuracy** and **0.2868 test loss** evaluated on 1,080 unseen real-world images from the Merged Waste Classification Dataset (MWCD).
   - Accurately classifies waste into **6 categories**:
     - 🍏 **Organic / Biodegradable** (Food scraps, garden waste, compostable matter)
     - 🧴 **Plastic Waste** (PET bottles, HDPE containers, rigid packaging)
     - 📦 **Paper & Cardboard** (Boxes, newspapers, cartons, pulp packaging)
     - 🥫 **Metal & Cans** (Aluminum soda cans, tin food cans, foil trays)
     - 🍾 **Glassware & Bottles** (Culinary jars, beverage bottles, vials)
     - 🔋 **E-Waste & Hazardous** (Electronics, cables, circuit boards, batteries)

2. **Dual-Mode Camera & Image Ingestion**:
   - Drag-and-drop file uploader supporting JPG, PNG, and WebP up to 10MB with instant preview.
   - Live camera integration supporting mobile device camera capture (`capture="environment"`) and in-browser WebRTC video stream with front/rear lens switching.

3. **Disposal Guidance & Ecological Insights**:
   - Color-coded bin recommendations (Green, Blue, Yellow, Cyan, Red).
   - Recyclability badge (Recyclable, Compostable, Hazardous).
   - Practical preparation instructions (cleaning, flattening, lid separation).
   - Scientifically grounded environmental impact metrics per category.

4. **Confidence Transparency & Uncertainty Guard**:
   - Predictions with confidence $< 60\%$ automatically trigger an **Uncertainty Alert** rather than presenting false certainty.
   - Full softmax probability distribution breakdown across all classes.

5. **User Feedback & Misclassification Triage Queue**:
   - Users can report misclassifications and suggest correct categories.
   - Reports enter a protected triage queue for administrator review to prevent dataset poisoning; unverified feedback is never used to automatically retrain the neural network.

6. **Authentication, RBAC & User Isolation**:
   - Secure JWT-based authentication with bcrypt password hashing.
   - User registration (+50 welcome points), login, logout, password change, and token-based forgot/reset password workflows.
   - Role-Based Access Control (`user` vs `admin`).
   - Strict user data isolation: users only see and export their own scan history.

7. **Gamification, Eco-Points & Badges**:
   - Configurable weekly challenges and daily streaks.
   - Eco-points awarded strictly for recorded scans (+10 pts) and verified actions.
   - Unlockable sustainability badges (First Step, Polymer Guardian, Circuit Savior, Eco Centurion) and community leaderboard.

8. **Verified Recycling & E-Waste Center Locator**:
   - Real-world directory of verified municipal collection points and certified e-waste facilities.
   - Filter by accepted material type (Plastic, Paper, Metal, Glass, Organic, E-Waste).
   - Geolocation-based distance calculation via Haversine formula with graceful fallback on permission denial.
   - Direct navigation links to Google Maps.

9. **Searchable Comprehensive Waste Guide**:
   - Interactive database of accepted items, contaminants to avoid, bin rules, and preparation protocols for all 6 target classes.

10. **Interactive Conversational AI Assistant (“Chat with AI”)**:
    - Dedicated waste segregation and recycling chatbot connected to **Google Gemini** (or OpenAI).
    - Transparent zero-config offline knowledge-base fallback when no API key is configured.
    - Context-aware scan referencing: explains previous image scans directly from the database.
    - Quick chip queries for common waste questions ("How do I recycle plastic?", "How should I dispose of batteries?").
    - Strict focus guard on waste management, recycling, and sustainable living.

11. **Administrator Control Plane**:
    - Role-protected dashboard monitoring total registered users, scan volume, category distribution, and model version telemetry.
    - Review and resolve user misclassification reports.
    - Verified test-set benchmark display clearly separated from inference confidence scores.

11. **Data Portability**:
    - One-click scan history export to structured CSV reports.

12. **Strict Light Theme UI**:
    - Complies with the specified design palette:
      - Primary Green: `#16845B`
      - Light Mint: `#EAF5EC`
      - Main Background: `#F7FAF7`
      - White Cards: `#FFFFFF`
      - Main Text: `#183B2B`
      - Secondary Text: `#52705F`

---

## 📊 Dataset & Model Benchmark Results

The model was trained on the **Merged Waste Classification Dataset (MWCD)**:

| Metric | Value |
| :--- | :--- |
| **Total Images Inspected** | 35,168 raw images across 9 subdirectories |
| **Deduplicated Balanced Subset** | 7,200 unique images (2,488 byte-exact duplicates removed to prevent leakage) |
| **Stratified Split Ratio** | 70% Train (5,040) / 15% Validation (1,080) / 15% Held-Out Test (1,080) |
| **Target Classes** | 6 balanced classes (840 train / 180 val / 180 test per class) |
| **Backbone Architecture** | MobileNetV3-Small (ImageNet pre-trained) |
| **Training Scheme** | Stage 1: Frozen backbone (6 epochs) + Stage 2: Top 30 layer fine-tuning (3 epochs) |
| **Held-Out Test Accuracy** | **90.65%** |
| **Held-Out Test Loss** | **0.2868** |
| **Validation Accuracy** | **89.17%** |
| **Average CPU Inference Latency**| **~28.4 ms** per image |

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons | Responsive, accessible, mobile-first light theme |
| **Backend API** | Python 3.13, FastAPI, Uvicorn | Asynchronous REST API with CORS and JWT security |
| **Deep Learning** | TensorFlow 2.20, Keras 3, MobileNetV3 | Fine-tuned convolutional neural network |
| **Database & ORM** | PostgreSQL / SQLite fallback, SQLAlchemy 2.0 | Multi-table schema with relational foreign keys |
| **Security** | Passlib (bcrypt), python-jose, python-multipart | PBKDF2/bcrypt hashing, JWT tokens |
| **Testing** | Pytest, HTTPX, Vitest, Testing Library | 19 backend tests + 5 frontend tests |

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js v18+ & npm

### 2. Backend Setup
```bash
# From workspace root
# Install backend dependencies
python -m pip install -r backend/requirements.txt

# Run backend development server
python -m uvicorn app.main:app --app-dir backend --port 8000
```
- Interactive Swagger API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- API Health Status: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 3. Frontend Setup
```bash
# In a new terminal
cd frontend

# Install dependencies
npm install

# Run frontend development server
npm run dev -- --host
```
- Web Application: [http://localhost:5173](http://localhost:5173)

### Default Admin Credentials
- **Email:** `admin@wastewise.org`
- **Password:** `Admin@WasteWise2026!`

---

## 🧪 Running Automated Tests

### Backend Test Suite (Pytest - 19 Tests)
```bash
# Runs full auth, admin, classification, image processing, and centers tests
python -m pytest backend/tests -v
```

### Frontend Test Suite (Vitest - 5 Tests)
```bash
cd frontend
npm test
```

### Frontend Production Build Verification
```bash
cd frontend
npm run build
```

---

## 📂 Project Directory Structure

```text
AI-WasteWise/
├── README.md
├── backend/
│   ├── requirements.txt
│   ├── pytest.ini
│   ├── app/
│   │   ├── main.py                     # FastAPI entrypoint, lifespan pre-warming, static mounts
│   │   ├── config.py                   # Pydantic Settings
│   │   ├── api/
│   │   │   ├── deps.py                 # JWT dependency guards (get_current_user, get_current_admin)
│   │   │   └── v1/
│   │   │       ├── router.py           # Unified REST API router
│   │   │       └── endpoints/
│   │   │           ├── auth.py         # Login, register, me, change-password, forgot/reset-password
│   │   │           ├── classify.py     # Waste classification with user attribution & eco-points
│   │   │           ├── history.py      # Scan history, user isolation, item deletion, CSV export
│   │   │           ├── centers.py      # Recycling centers directory with Haversine distance
│   │   │           ├── feedback.py     # User misclassification feedback reports
│   │   │           ├── gamification.py # Eco challenges, badges, and leaderboard
│   │   │           ├── admin.py        # Admin stats, user management, feedback triage, telemetry
│   │   │           ├── stats.py        # Dashboard metrics
│   │   │           └── health.py       # Health check & category metadata
│   │   ├── core/
│   │   │   ├── security.py             # Bcrypt hashing & JWT encode/decode
│   │   │   ├── guidance.py             # Bin rules & environmental impact knowledge base
│   │   │   └── exceptions.py           # Standardized error handlers
│   │   ├── db/
│   │   │   ├── base.py                 # DeclarativeBase with model registrations
│   │   │   ├── session.py              # Engine factory (PostgreSQL with SQLite fallback)
│   │   │   └── init_db.py              # Seeds admin user, recycling centers & eco-challenges
│   │   ├── models/
│   │   │   ├── user.py                 # User ORM entity
│   │   │   ├── classification.py       # ClassificationRecord ORM entity
│   │   │   ├── center.py               # RecyclingCenter ORM entity
│   │   │   ├── feedback.py             # UserFeedback ORM entity
│   │   │   └── gamification.py         # EcoChallenge & UserBadge ORM entities
│   │   ├── schemas/                    # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── ai_model.py             # MobileNetV3 inference engine & weight loader
│   │   │   └── image_processor.py      # EXIF correction & 224x224 tensor normalization
│   │   └── uploads/                    # Sanitized uploaded images
│   ├── ml/
│   │   ├── inspect_dataset.py          # Non-destructive MWCD dataset inspector
│   │   ├── prepare_dataset.py          # Stratified deduplicated 70/15/15 dataset builder
│   │   ├── train_mobilenetv3.py        # Two-stage MobileNetV3 transfer learning training script
│   │   ├── dataset_split_manifest.json # Split metadata and class distributions
│   │   ├── training_metrics.json       # Exact held-out test evaluation benchmarks
│   │   └── weights/
│   │       └── mobilenetv3_wastewise.weights.h5 # Trained fine-tuned model weights
│   └── tests/                          # 19 automated Pytest tests
└── frontend/
    ├── package.json
    ├── tailwind.config.js              # Strict light theme configuration
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx         # React auth context & token management
    │   ├── api/
    │   │   └── client.js               # Comprehensive REST API client & CSV exporter
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Navbar.jsx          # Light theme navbar with user menu & admin badge
    │   │   │   └── Footer.jsx          # Light theme footer
    │   │   └── classify/
    │   │       ├── ImageUploader.jsx   # Drag-and-drop file upload & preview
    │   │       ├── CameraModal.jsx     # WebRTC & mobile camera capture
    │   │       ├── PredictionCard.jsx  # Confidence meter, probabilities, feedback report modal
    │   │       └── GuidanceCard.jsx    # Target bin & disposal steps
    │   ├── pages/
    │   │   ├── HomePage.jsx            # Modern environmental SaaS landing page
    │   │   ├── ClassifyPage.jsx        # Waste classification page
    │   │   ├── WasteGuidePage.jsx      # Searchable disposal guide for 6 categories
    │   │   ├── RecyclingLocatorPage.jsx# Center locator with material filter & distance
    │   │   ├── EcoChallengesPage.jsx   # Eco-points, challenges, badges & leaderboard
    │   │   ├── HistoryPage.jsx         # User scan history with search & CSV export
    │   │   ├── DashboardPage.jsx       # Real database analytics & 7-day trend
    │   │   ├── ProfilePage.jsx         # User profile, password change, CSV export
    │   │   ├── AdminDashboardPage.jsx  # Administrator control plane & feedback triage
    │   │   ├── LoginPage.jsx           # User login page
    │   │   ├── RegisterPage.jsx        # User registration page (+50 points)
    │   │   └── ForgotPasswordPage.jsx  # Token-based password recovery
    │   └── tests/                      # 5 Vitest component and navigation tests
```

---

## 🎓 Academic Presentation & Defense Notes

1. **Why MobileNetV3-Small?**
   - In comparison to heavier backbones like ResNet-50 or VGG-16, MobileNetV3 employs depthwise separable convolutions, hard-swish non-linear activations, and squeeze-and-excitation attention blocks. This achieves an inference latency of **~28.4ms on CPU**, making it suitable for edge and mobile deployments without requiring expensive GPU servers.

2. **Mitigating Data Leakage**:
   - The raw MWCD dataset contained 2,488 byte-exact duplicate images. If left unaddressed, identical copies would appear across both training and test sets, artificially inflating reported accuracy. Our pipeline pruned duplicates and enforced a reproducible stratified split with a fixed random seed (`seed=42`).

3. **Inference vs. Accuracy Distinction**:
   - A common pitfall in ML applications is confusing an individual prediction's softmax confidence with true model accuracy. The application explicitly distinguishes individual prediction confidence from overall generalization accuracy (**90.65% on held-out test data**).

4. **Safety & Triage Queue Against Data Poisoning**:
   - Rather than automatically retraining weights on arbitrary user inputs (which leaves models vulnerable to malicious adversarial data poisoning), user-reported misclassifications are routed to an administrative triage review queue.
