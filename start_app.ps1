Write-Host "Starting Backend..."
Start-Process cmd -ArgumentList "/k cd server && npm start" -WorkingDirectory "C:\Users\z4pro\.gemini\antigravity\scratch\zvitpyq"

Write-Host "Starting Frontend..."
Start-Process cmd -ArgumentList "/k cd client && npm run dev" -WorkingDirectory "C:\Users\z4pro\.gemini\antigravity\scratch\zvitpyq"

Write-Host "Servers are starting in new windows."
Write-Host "Backend: http://localhost:5000"
Write-Host "Frontend: http://localhost:5173"
