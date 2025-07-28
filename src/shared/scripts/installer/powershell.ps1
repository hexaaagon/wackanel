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
        $apiUrlLine = $config | Select-String "api_url"
        $apiKeyLine = $config | Select-String "api_key"
        
        if ($apiUrlLine) {
            $apiUrl = $apiUrlLine.ToString().Split('=')[1].Trim()
        } else {
            $apiUrl = ""
        }
        
        if ($apiKeyLine) {
            $apiKey = $apiKeyLine.ToString().Split('=')[1].Trim()
        } else {
            $apiKey = ""
        }
        
        Write-Host "API URL: $apiUrl"
        
        # Safely display API key
        if ($apiKey -and $apiKey.Length -gt 8) {
            Write-Host ("API Key: " + $apiKey.Substring(0,4) + "..." + $apiKey.Substring($apiKey.Length-4))
        } elseif ($apiKey -and $apiKey.Length -gt 0) {
            Write-Host ("API Key: " + $apiKey.Substring(0, [Math]::Min(4, $apiKey.Length)) + "...")
        } else {
            Write-Host "API Key: (empty or invalid)"
        }
        
        # Validate credentials before sending test heartbeat
        if (-not $apiUrl -or $apiUrl.Trim() -eq "" -or $apiUrl -eq "{{WACKANEL_API_URL}}") {
            Write-Host "WARNING: API URL is empty or not configured properly" -ForegroundColor Yellow
            Write-Host "Skipping test heartbeat..." -ForegroundColor Yellow
        } elseif (-not $apiKey -or $apiKey.Trim() -eq "" -or $apiKey -eq "{{WACKANEL_API_KEY}}") {
            Write-Host "WARNING: API Key is empty or not configured properly" -ForegroundColor Yellow
            Write-Host "Skipping test heartbeat..." -ForegroundColor Yellow
        } else {
            Write-Host "Sending test heartbeat..."
            $time = [Math]::Floor([decimal](Get-Date(Get-Date).ToUniversalTime()-uformat '%s'))
            $heartbeat = @{
                type = 'file'
                time = $time
                entity = 'test.txt'
                language = 'Text'
            }
            
            try {
                $response = Invoke-RestMethod -Uri "$apiUrl/users/current/heartbeats" `
                    -Method Post `
                    -Headers @{Authorization="Bearer $apiKey"} `
                    -ContentType 'application/json' `
                    -Body "[$($heartbeat | ConvertTo-Json)]"
                    
                Write-Host "Test heartbeat sent successfully" -ForegroundColor Green
            } catch {
                Write-Host "WARNING: Test heartbeat failed: $($_.Exception.Message)" -ForegroundColor Yellow
                Write-Host "This might be normal if the server is not running or credentials are incorrect." -ForegroundColor Yellow
            }
        }
        
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