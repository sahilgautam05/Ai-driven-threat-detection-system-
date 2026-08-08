# Sentinel AI Native .NET HTTP Server
# Runs using built-in Windows PowerShell assemblies

$port = 8000
$workspace = "c:\Users\sahil\.antigravity\AI threat detection system"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "Sentinel Server running on http://localhost:$port/"
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") {
            $urlPath = "/index.html"
        }
        
        # Map URL to local path
        $cleanPath = $urlPath.TrimStart('/')
        # Unescape URL encoded characters (e.g. %20 -> space)
        $cleanPath = [System.Uri]::UnescapeDataString($cleanPath)
        
        # Combine workspace and clean URL path
        $localPath = [System.IO.Path]::Combine($workspace, $cleanPath)
        
        # Normalize slashes to backslashes for Windows filesystem
        $localPath = $localPath.Replace('/', '\')
        
        if (Test-Path $localPath -PathType Leaf) {
            # Determine Content Type
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $contentType = "text/plain"
            if ($ext -eq ".html") { $contentType = "text/html; charset=utf-8" }
            elseif ($ext -eq ".css") { $contentType = "text/css; charset=utf-8" }
            elseif ($ext -eq ".js") { $contentType = "application/javascript; charset=utf-8" }
            elseif ($ext -eq ".json") { $contentType = "application/json; charset=utf-8" }
            elseif ($ext -eq ".png") { $contentType = "image/png" }
            elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") { $contentType = "image/jpeg" }
            
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $response.StatusDescription = "Not Found"
            $errorMsg = [System.Text.Encoding]::UTF8.GetBytes("File Not Found: $urlPath")
            $response.OutputStream.Write($errorMsg, 0, $errorMsg.Length)
        }
        
        $response.Close()
    }
} catch {
    Write-Error $_.Exception.Message
} finally {
    $listener.Close()
}
