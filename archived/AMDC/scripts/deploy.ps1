# AMDC 一键部署脚本 (Windows PowerShell)
# 用法:
#   irm https://gitee.com/Hawkiethehawk/AMDC/raw/master/scripts/deploy.ps1 | iex
#   或: powershell -ExecutionPolicy Bypass -File scripts\deploy.ps1  (在已克隆的仓库内)
param(
    [string]$InstallDir = $PWD.Path
)

$ErrorActionPreference = "Stop"
$RepoUrl = "https://gitee.com/Hawkiethehawk/AMDC.git"

function Register-AMDCShellIntegration {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ProjectDir
    )

    $resolvedProjectDir = (Resolve-Path -LiteralPath $ProjectDir).Path
    [Environment]::SetEnvironmentVariable("AMDC_PROJECT_DIR", $resolvedProjectDir, "User")
    $env:AMDC_PROJECT_DIR = $resolvedProjectDir

    $profilePath = $PROFILE
    if ([string]::IsNullOrWhiteSpace($profilePath)) {
        Write-Host "[!] 未找到 PowerShell profile，已仅设置 AMDC_PROJECT_DIR" -ForegroundColor Yellow
        return
    }

    $profileDir = Split-Path -Parent $profilePath
    New-Item -ItemType Directory -Force -Path $profileDir | Out-Null
    if (-not (Test-Path -LiteralPath $profilePath)) {
        New-Item -ItemType File -Force -Path $profilePath | Out-Null
    }

    $marker = "# >>> AMDC default project >>>"
    $profileText = Get-Content -Raw -LiteralPath $profilePath
    if ($profileText -notmatch [regex]::Escape($marker)) {
        $profileBlock = @'
# >>> AMDC default project >>>
function amdc {
    $projectDir = $env:AMDC_PROJECT_DIR
    if ([string]::IsNullOrWhiteSpace($projectDir)) {
        throw "AMDC_PROJECT_DIR is not set. Run the AMDC deployment script again."
    }
    if (-not (Test-Path -LiteralPath $projectDir -PathType Container)) {
        throw "AMDC project directory does not exist: $projectDir"
    }

    Set-Location -LiteralPath $projectDir
    $command = Get-Command amdc.cmd -CommandType Application -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if (-not $command) {
        throw "amdc.cmd was not found. Run npm link or install the AMDC CLI again."
    }
    & $command.Source @args
}
# <<< AMDC default project <<<
'@
        if (-not [string]::IsNullOrWhiteSpace($profileText) -and -not $profileText.EndsWith([Environment]::NewLine)) {
            Add-Content -LiteralPath $profilePath -Value ""
        }
        Add-Content -LiteralPath $profilePath -Value $profileBlock
        Write-Host "[✓] 已配置 PowerShell amdc 默认进入项目目录" -ForegroundColor Green
    } else {
        Write-Host "[✓] PowerShell amdc 包装函数已存在" -ForegroundColor Green
    }

    Write-Host "[✓] 已设置默认项目目录: $resolvedProjectDir" -ForegroundColor Green
}

# 支持通过环境变量覆盖
if ($env:AMDC_INSTALL_DIR) {
    $InstallDir = $env:AMDC_INSTALL_DIR
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  AMDC 一键部署 (Windows)" -ForegroundColor Cyan
Write-Host "  安装目录: $InstallDir" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. 克隆 ──
if (Test-Path "$InstallDir\am.js") {
    Write-Host "[✓] 仓库已存在，跳过克隆" -ForegroundColor Green
} elseif (Test-Path "$InstallDir\.git") {
    Write-Host "[✓] 检测到 git 仓库" -ForegroundColor Green
    $remote = git -C $InstallDir remote get-url origin 2>$null
    if ($remote -match 'amdc') {
        Write-Host "[✓] 确认 AMDC 仓库" -ForegroundColor Green
    } else {
        Write-Host "[!] 当前目录非 AMDC 仓库，克隆到子目录..." -ForegroundColor Yellow
        $InstallDir = Join-Path $InstallDir "AMDC"
        git clone $RepoUrl $InstallDir
    }
} else {
    Write-Host "[✓] 克隆仓库到当前目录..." -ForegroundColor Green
    # 如果 InstallDir 是盘符根目录或已存在非空目录，克隆到子目录 AMDC
    if ($InstallDir -match '^[A-Z]:\\$' -or (Test-Path $InstallDir)) {
        $InstallDir = Join-Path $InstallDir "AMDC"
        Write-Host "  将安装到: $InstallDir" -ForegroundColor Yellow
    } else {
        New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
    }
    git clone $RepoUrl $InstallDir
}

Set-Location $InstallDir
$InstallDir = (Get-Location).Path

# ── 2. Node 依赖 ──
Write-Host "[✓] 安装 Node 依赖..." -ForegroundColor Green
npm install
Write-Host "[✓] MiSans 本地字体已随项目就绪" -ForegroundColor Green

# ── 3. Python 依赖 ──
Write-Host "[✓] 安装 openpyxl..." -ForegroundColor Green
try {
    python -c "import openpyxl" 2>$null
    Write-Host "[✓] openpyxl 已安装" -ForegroundColor Green
} catch {
    pip install openpyxl
}

# ── 4. 全局 CLI ──
Write-Host "[✓] 注册全局 amdc 命令..." -ForegroundColor Green
npm link

# ── 5. 默认项目目录与 PowerShell 包装 ──
Write-Host "[✓] 配置 amdc 默认项目目录..." -ForegroundColor Green
Register-AMDCShellIntegration -ProjectDir $InstallDir

# ── 6. 验证 ──
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "[✓] 部署完成！" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  项目目录 : $InstallDir"
Write-Host "  默认目录 : 新开的 PowerShell 会自动定位到上述项目目录"
Write-Host "  Dashboard: amdc dashboard  (Windows 8787 / WSL 8788)"
Write-Host ""
Write-Host "  下一步 — 登录账号（逐个执行）:" -ForegroundColor Yellow
Write-Host '    $env:AMDC_EMAIL="账号@邮箱.com"; amdc login'
Write-Host '    $env:AMDC_EMAIL="账号@邮箱.com"; $env:AMDC_USERDATA_DIR=".amdc-userdata-b"; amdc login'
Write-Host "    ... (6个 profile a-f)"
Write-Host ""
Write-Host "  或查看状态: amdc status" -ForegroundColor Yellow
