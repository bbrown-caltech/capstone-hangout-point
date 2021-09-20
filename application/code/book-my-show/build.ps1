param([System.String]$branch='develop', [System.String]$tag='develop', [System.String]$environment='local')

$service="FMS Intelligence Support Tool"
$image='docker-fmswf.di2e.net/fmswf-applications/fms-intelligence-support-tool:' + $tag

Write-Host "" -ForegroundColor White -BackgroundColor Black
Write-Host "" -ForegroundColor White -BackgroundColor Black
Write-Host "####################################################################################" -ForegroundColor White -BackgroundColor Black
Write-Host "#   Removing Previous Image" -ForegroundColor White -BackgroundColor Black
Write-Host "####################################################################################" -ForegroundColor White -BackgroundColor Black
docker rmi $image --force


Write-Host "" -ForegroundColor White -BackgroundColor Black
Write-Host "" -ForegroundColor White -BackgroundColor Black
Write-Host "####################################################################################" -ForegroundColor White -BackgroundColor Black
Write-Host "#   Building $service Docker Image" -ForegroundColor White -BackgroundColor Black
Write-Host "####################################################################################" -ForegroundColor White -BackgroundColor Black
docker build --no-cache -t $image --build-arg BRANCH=$branch --build-arg ENVIRONMENT=$environment .


Write-Host "" -ForegroundColor White -BackgroundColor Black
Write-Host "" -ForegroundColor White -BackgroundColor Black
Write-Host "####################################################################################" -ForegroundColor White -BackgroundColor Black
Write-Host "#   Pushing $service Docker Image to DI2E" -ForegroundColor White -BackgroundColor Black
Write-Host "####################################################################################" -ForegroundColor White -BackgroundColor Black
# docker push $image
