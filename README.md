# AI WasteWise — AI-Based Waste Classification and Management System

A full-stack, AI-powered automated waste segregation and management platform developed for final-year engineering capstone and major project evaluation.

---

## 🌟 Key Features

1. **AI-Powered Image Classification**: Leverages **MobileNetV3 transfer learning** via TensorFlow/Keras to accurately classify waste into **6 categories**:
   - 🍏 **Organic / Biodegradable** (Food waste, compostable matter)
   - 🧴 **Plastic Waste** (PET bottles, wrappers, containers)
   - 📦 **Paper & Cardboard** (Boxes, newspapers, cartons)
   - 🥫 **Metal & Cans** (Soda cans, tin cans, foils)
   - 🍾 **Glassware & Bottles** (Jars, containers)
   - 🔋 **E-Waste & Hazardous** (Batteries, electronic hardware)
2. **Camera & File Ingestion**:
   - Drag-and-drop file uploader with instant client-side preview.
   - Dual-mode camera integration: Native mobile device camera trigger (`capture="environment"`) and WebRTC live browser webcam preview with front/rear switching.
3. **Disposal Guidance & Ecological Insights**:
   - Direct color-coded bin recommendation (Green, Blue, Yellow, Cyan, Red).
   - Recyclability badge (Recyclable, Non-Recyclable, Hazardous).
   - Step-by-step disposal protocol and real environmental impact metrics.
4. **Uncertainty & Out-Of-Distribution (OOD) Guard**:
   - Softmax confidence threshold ($< 60\%$) automatically flags ambiguous or unidentifiable items with advisory guidance rather than false certainty.
5. **Audit Trail & Classification History**:
   - Paginated historical log with category filtering, image thumbnails, confidence ratings, and record deletion.
6. **Live Analytics Dashboard**:
   - Real-time database metrics showing total scans, recyclable ratio, hazardous waste diverted, and average model confidence.
   - Category distribution progress breakdown and 7-day volume trends.
7. **Strict Light Theme UI**:
   - Engineered adhering to the project palette:
     - Primary Green: `#16845B`
     - Light Mint: `#EAF5EC`
     - Main Background: `#F7FAF7`
     - Cards: `#FFFFFF`
     - Main Text: `#183B2B`
     - Secondary Text: `#52705F`

---

## 🏗️ System Architecture

```text
       ┌────────────────────────────────────────────────────────┐
       │                React 19 Frontend (Vite)                │
       │    - Camera / File Upload   - Disposal Guidance Card   │
       │    - History View           - Live Analytics Dashboard │
       └───────────────────────────┬────────────────────────────┘
                                   │ HTTP Multipart / REST
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                 FastAPI Python Backend                 │
       │  ┌─────────────────────────┐ ┌──────────────────────┐  │
       │  │ Pillow & NumPy Preproc  │ │ MobileNetV3 Transfer │  │
       │  │ (224x224, EXIF, RGB)    │ │ Learning Engine      │  │
       │  └─────────────────────────┘ └──────────────────────┘  │
       │  ┌─────────────────────────┐ ┌──────────────────────┐  │
       │  │ Uncertainty Guard       │ │ SQLAlchemy ORM       │  │
       │  │ (Confidence < 0.60)     │ │ (PostgreSQL / SQLite)│  │
       │  └─────────────────────────┘ └──────────────────────┘  │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │         PostgreSQL Database / Uploads Storage          │
       │  - classification_records table                        │
       │  - backend/app/uploads/ (sanitized images)             │
       └────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons | Responsive, mobile-first light theme interface |
| **Backend API** | Python 3.13, FastAPI, Uvicorn | High-throughput asynchronous RESTful API |
| **Deep Learning** | TensorFlow 2.20, Keras 3, MobileNetV3 | Lightweight transfer learning waste classifier |
| **Image Processing** | Pillow, NumPy | EXIF orientation, RGB channel hygiene, 224x224 tensor normalization |
| **Database & ORM** | PostgreSQL / SQLite, SQLAlchemy 2.0 | Transactional persistence of prediction records & analytics |
| **Testing** | Pytest, HTTPX, Vitest, React Testing Library | Full test coverage across backend and frontend |

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js v18+ & npm
- Git

### 2. Backend Setup
```bash
cd backend

# Install dependencies
python -m pip install -r requirements.txt

# Configure environment (defaults to SQLite; update for PostgreSQL)
cp .env.example .env

# Run backend development server
python -m uvicorn app.main:app --reload --port 8000
```
- Interactive API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- API Health Status: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run frontend development server
npm run dev
```
- Web Application: [http://localhost:5173](http://localhost:5173)

---

## 🐘 Configuring PostgreSQL

To connect the application to PostgreSQL:
1. Ensure your PostgreSQL server is active and create a database named `wastewise`:
   ```sql
   CREATE DATABASE wastewise;
   ```
2. Open `backend/.env` and update the `DATABASE_URL`:
   ```ini
   DATABASE_URL=postgresql+psycopg2://postgres:your_password@localhost:5432/wastewise
   ```
3. Restart the FastAPI server. SQLAlchemy will automatically initialize the `classification_records` table on launch.

---

## 🧪 Running Automated Tests

### Backend Unit & Integration Tests (Pytest)
```bash
# From the project root
python -m pytest backend/tests -v
```
*Tests cover image format verification, corrupted file rejection, dimension boundaries, classification endpoint flow, database persistence, history pagination, and dashboard stats aggregation.*

### Frontend Component Tests (Vitest)
```bash
cd frontend
npm test
```
*Tests cover confident prediction displays, uncertainty warning badges, probability breakdowns, and guidance cards.*

---

## 📂 Project Directory Structure

```text
AI-WasteWise/
├── README.md
├── .gitignore
├── backend/
│   ├── requirements.txt
│   ├── pytest.ini
│   ├── .env.example
│   ├── app/
│   │   ├── main.py                    # FastAPI entrypoint, CORS, static uploads
│   │   ├── config.py                  # Pydantic Settings
│   │   ├── api/v1/endpoints/
│   │   │   ├── classify.py            # Image upload & AI prediction
│   │   │   ├── history.py             # Paginated history & delete
│   │   │   ├── stats.py               # Dashboard aggregation
│   │   │   └── health.py              # Health & categories metadata
│   │   ├── core/
│   │   │   ├── guidance.py            # Disposal knowledge base
│   │   │   └── exceptions.py          # API error handlers
│   │   ├── db/
│   │   │   ├── session.py             # SQLAlchemy session factory
│   │   │   └── base.py                # Declarative base
│   │   ├── models/
│   │   │   └── classification.py      # ClassificationRecord ORM table
│   │   ├── schemas/                   # Pydantic request/response models
│   │   ├── services/
│   │   │   ├── ai_model.py            # MobileNetV3 Transfer Learning engine
│   │   │   └── image_processor.py     # Pillow & NumPy preprocessing
│   │   └── uploads/                   # Sanitized image storage
│   ├── ml/
│   │   ├── labels.json                # Supported classes
│   │   ├── train_mobilenetv3.py       # Dataset fine-tuning script
│   │   └── weights/                   # MobileNetV3 model weights
│   └── tests/                         # Pytest test suite
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js             # Strict light theme configuration
    ├── index.html
    ├── src/
    │   ├── index.css                  # Light-only color enforcement
    │   ├── App.jsx                    # Navigation & layout
    │   ├── api/client.js              # REST API client
    │   ├── components/
    │   │   ├── common/Navbar.jsx      # Mobile-responsive light navbar
    │   │   ├── common/Footer.jsx
    │   │   ├── classify/ImageUploader.jsx
    │   │   ├── classify/CameraModal.jsx
    │   │   ├── classify/PredictionCard.jsx
    │   │   └── classify/GuidanceCard.jsx
    │   ├── pages/
    │   │   ├── ClassifyPage.jsx
    │   │   ├── HistoryPage.jsx
    │   │   └── DashboardPage.jsx
    │   └── tests/                     # Vitest test suite
```

---

## 🎓 Academic Presentation Notes

- **Model Choice Rationale**: MobileNetV3 Small was selected over heavier architectures (ResNet-50 / VGG-16) due to its superior inference latency on edge/client-server configurations and inverted residual blocks with hard-swish activation, making it suitable for mobile waste capture applications.
- **Handling False Positives**: Waste classification in practical environments suffers from ambiguous and out-of-distribution items. The built-in uncertainty threshold ensures the system does not give misleading high-confidence recommendations on unrecognizable items.
