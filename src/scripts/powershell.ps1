try {
    $configPath = "$env:USERPROFILE\.wakatime.cfg"
    if (Test-Path $configPath) {
        Write-Host "[INFO] Config file already exists, moving into ~/.wakatime.cfg.old"
        Move-Item -Path $configPath -Destination "$configPath.old"
    }

    $apiUrl = "{{WACKANEL_API_URL}}"
    $apiKey = "{{WACKANEL_API_KEY}}"
    
    # If replacement strings are still placeholders, use environment variables
    if ($apiUrl -eq "{{WACKANEL_API_URL}}") {
        $apiUrl = $env:WACKANEL_API_URL
    }
    if ($apiKey -eq "{{WACKANEL_API_KEY}}") {
        $apiKey = $env:WACKANEL_API_KEY
    }

    @"
[settings]
api_url = $apiUrl
api_key = $apiKey
"@ | Out-File -FilePath $configPath -Force -Encoding utf8
    
    Write-Host "Config file created at $configPath"

    if (Test-Path $configPath) {
        $config = Get-Content $configPath
        $apiUrl = ($config | Select-String "api_url").ToString().Split('=')[1].Trim()
        $apiKey = ($config | Select-String "api_key").ToString().Split('=')[1].Trim()
        
        Write-Host "API URL: $apiUrl"
        Write-Host ("API Key: " + $apiKey.Substring(0,4) + "..." + $apiKey.Substring($apiKey.Length-4))  # Show first/last 4 chars
        
        Write-Host "Sending test heartbeat..."
        $time = [Math]::Floor([decimal](Get-Date(Get-Date).ToUniversalTime()-uformat '%s'))
        $heartbeat = @{
            type = 'file'
            time = $time
            entity = 'test.txt'
            language = 'Text'
        }
        
        $response = Invoke-RestMethod -Uri "$apiUrl/users/current/heartbeats" `
            -Method Post `
            -Headers @{Authorization="Bearer $apiKey"} `
            -ContentType 'application/json' `
            -Body "[$($heartbeat | ConvertTo-Json)]"
            
        Write-Host "Test heartbeat sent successfully"
        
        Write-Host "`nWackanel setup complete!" -ForegroundColor Green
        Write-Host "Ready to track!" -ForegroundColor Green
        Write-Host "Your custom instance is configured." -ForegroundColor Yellow
        Write-Host "`n"
    } else {
        throw "Failed to create config file"
    }
} catch {
    Write-Host "----------------------------------------"
    Write-Host "ERROR: An error occurred during setup:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "----------------------------------------"
}
finally {
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
}