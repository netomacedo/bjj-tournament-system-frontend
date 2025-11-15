# Quick Start Guide - BJJ Tournament Frontend

## ⚡ Get Started in 5 Minutes

### Prerequisites
- Node.js 16+ installed ([Download here](https://nodejs.org/))
- Your backend API running on `http://localhost:8080`

### Step 1: Extract the Archive
```bash
tar -xzf bjj-tournament-frontend.tar.gz
cd bjj-tournament-frontend
```

### Step 2: Install Dependencies
```bash
npm install
```
⏱️ This takes about 2-3 minutes

### Step 3: Configure Backend URL
```bash
# Create environment file
cp .env.example .env

# Edit .env file (it should contain):
# REACT_APP_API_URL=http://localhost:8080/api
```

### Step 4: Start the Application
```bash
npm start
```

🎉 **Done!** The app will open at `http://localhost:3000`

---

## Alternative: Automated Setup

```bash
# After extracting, just run:
chmod +x setup.sh
./setup.sh

# Then:
npm start
```

---

## First Time Setup Checklist

- [ ] Backend API is running
- [ ] Node.js is installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with correct API URL
- [ ] CORS configured in backend (see below)

---

## Backend CORS Configuration

Add this to your Spring Boot backend:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*");
    }
}
```

---

## Common Issues & Solutions

### ❌ "Cannot connect to backend"
**Solution:** Verify backend is running on port 8080

### ❌ "CORS error"
**Solution:** Add CORS configuration to backend (see above)

### ❌ "Module not found"
**Solution:** Run `npm install` again

### ❌ Port 3000 already in use
**Solution:** Kill the process or use different port:
```bash
PORT=3001 npm start
```

---

## What to Try First

1. **View Dashboard** - See overview statistics
2. **Register an Athlete** - Click "Athletes" → "+ Register New Athlete"
3. **Create a Tournament** - Click "Tournaments" → "+ Create New Tournament"
4. **Browse Features** - Explore all navigation items

---

## Build for Production

```bash
npm run build
```

Output will be in `build/` folder - ready to deploy!

---

## Need Help?

- 📖 Read `PROJECT_SUMMARY.md` for detailed information
- 🎨 Check `VISUAL_GUIDE.md` to see what each page looks like
- 📄 Read `README.md` for complete documentation

---

**That's it!** You're ready to manage BJJ tournaments with your new frontend! 🥋
