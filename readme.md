# koishi-plugin-onebot-info-image-api

> 先archieve了捏，因为我感觉有更优雅的的方案捏(
> 如果你想在koishi用，可以直接用这个呢：https://github.com/VincentZyuApps/koishi-plugin-onebot-info-image
> 如果想在其他地方用，(正在制作中...)

获取成员信息/管理员列表，发送文字/图片/合并转发消息，仅支持onebot

现在只做了lagrange和napcat的适配

## dev 
查看git大文件
```shell
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | Where-Object { $_ -match '^blob' } | ForEach-Object { $parts = $_ -split ' ', 4; [PSCustomObject]@{ Size = [int]$parts[2]; Name = $parts[3] } } | Sort-Object Size -Descending | Select-Object -First 20 
```
