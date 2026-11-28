. 'C:\Users\ACER\.codex\visualizations\2026\10\04\01a1053a-9276-7060-b263-2c566a07baba\club-ui-redesign\github-ui.ps1'
$ErrorActionPreference='Stop'
$out='C:\Users\ACER\.codex\visualizations\2026\10\04\01a1053a-9276-7060-b263-2c566a07baba\lab7-postdeploy-qa'
$freeze=(Get-Date).ToUniversalTime()
$start=[DateTimeOffset]::Parse('2026-11-27T00:00:00+07:00')
function Pages([string]$path){
  $list=[Collections.Generic.List[object]]::new()
  for($page=1;$page -le 50;$page++){
    $sep=if($path.Contains('?')){'&'}else{'?'}
    $response=Invoke-UiGitHub ($path+$sep+'per_page=100&page='+$page)
    $items=@($response|Where-Object {$null -ne $_})
    foreach($item in $items){if($item.id){$list.Add($item)}}
    if($items.Count -lt 100){break}
    if($page -eq 50){throw 'Pagination bound reached'}
  }
  return $list.ToArray()
}
$issues=Pages '/repos/chaproi/club-expense-approval/issues?state=all&sort=created&direction=desc'
$prs=Pages '/repos/chaproi/club-expense-approval/pulls?state=all&sort=created&direction=desc'
$completed=@($issues|Where-Object {!$_.pull_request -and $_.closed_at -and [DateTimeOffset]::Parse($_.closed_at) -ge $start -and [DateTimeOffset]::Parse($_.closed_at) -le $freeze})
$issueTable=@($completed|ForEach-Object {[pscustomobject]@{number=$_.number;title=$_.title;closedAt=$_.closed_at;reason=$_.state_reason;scope=if($_.number -eq 49){'Lab7'}else{'other project'};url=$_.html_url}})
$merged=@($prs|Where-Object {$_.merged_at -and [DateTimeOffset]::Parse($_.merged_at) -ge $start -and [DateTimeOffset]::Parse($_.merged_at) -le $freeze})
$prTable=@($merged|ForEach-Object {[pscustomobject]@{number=$_.number;title=$_.title;head=$_.head.ref;headSha=$_.head.sha;base=$_.base.ref;mergedAt=$_.merged_at;mergeSha=$_.merge_commit_sha;scope=if($_.number -in @(50,51,52)){'Lab7'}else{'other project'};url=$_.html_url}})
$runList=[Collections.Generic.List[object]]::new()
for($page=1;$page -le 20;$page++){
 $batch=Invoke-UiGitHub ('/repos/chaproi/club-expense-approval/actions/runs?per_page=100&page='+$page)
 foreach($r in @($batch.workflow_runs)){if($r.id){$runList.Add($r)}}
 if(@($batch.workflow_runs).Count -lt 100){break}
 if($page -eq 20){throw 'Run pagination bound reached'}
}
$shaSet=@('12d40ecf571d50a012045b324d48ae50459c21eb','c7f1c88e0b3bc78322d1dcc34c9ceb4c397361eb','b7cbdd1552f0cd0c3c818bb478c467577b1b44a1','cc4b732cc6709cfdc400033403c3b8815538baf1','c259afe45eb49311c1f7bb9e166c4443041b9b82')
$runs=@($runList|Where-Object {[DateTimeOffset]::Parse($_.created_at) -ge $start -and [DateTimeOffset]::Parse($_.created_at) -le $freeze -and $_.head_sha -in $shaSet})
$runTable=[Collections.Generic.List[object]]::new()
foreach($r in $runs){for($a=1;$a -le $r.run_attempt;$a++){
 $attempt=if($r.run_attempt -gt 1){Invoke-UiGitHub ('/repos/chaproi/club-expense-approval/actions/runs/'+$r.id+'/attempts/'+$a)}else{$r}
 $runTable.Add([pscustomobject]@{id=$r.id;attempt=$a;workflow=$attempt.name;event=$attempt.event;branch=$attempt.head_branch;sha=$attempt.head_sha;createdAt=$attempt.created_at;status=$attempt.status;conclusion=$attempt.conclusion;url=$attempt.html_url})
}}
$reviews=[Collections.Generic.List[object]]::new()
foreach($number in @(50,51,52)){
 $pr=Invoke-UiGitHub ('/repos/chaproi/club-expense-approval/pulls/'+$number)
 $rr=Invoke-UiGitHub ('/repos/chaproi/club-expense-approval/pulls/'+$number+'/reviews')
 $reviews.Add([pscustomobject]@{number=$number;author=$pr.user.login;created=$pr.created_at;title=$pr.title;headBranch=$pr.head.ref;headSha=$pr.head.sha;baseBranch=$pr.base.ref;merged=$pr.merged;mergeSha=$pr.merge_commit_sha;mergedAt=$pr.merged_at;url=$pr.html_url;reviews=@($rr|Where-Object {$_.id}|ForEach-Object {[pscustomobject]@{reviewer=$_.user.login;state=$_.state;sha=$_.commit_id;at=$_.submitted_at;url=$_.html_url;body=$_.body}})})
}
$issue49=$issues|Where-Object {$_.number -eq 49}|Select-Object -First 1
$result=[pscustomobject]@{repository='chaproi/club-expense-approval';windowStart=$start.ToString('o');snapshotUtc=$freeze.ToString('o');sourceCounts=@{allIssuesAndPRs=$issues.Count;allPRs=$prs.Count;allRuns=$runList.Count};completedIssueEntries=$issueTable;completedIssueCount=@($issueTable|Where-Object {$_.reason -eq 'completed'}).Count;excludedClosures=@($issueTable|Where-Object {$_.reason -ne 'completed'});mergedPRCount=$prTable.Count;mergedPRs=$prTable;ciAttempts=$runTable.ToArray();ciOutcomeCounts=@($runTable|Group-Object conclusion|ForEach-Object {[pscustomobject]@{outcome=$_.Name;count=$_.Count}});issue49=@{state=$issue49.state;title=$issue49.title;url=$issue49.html_url};qualification='Repository-only fixed snapshot; original proposal and accepted maintenance runs included by explicit SHA inventory; reusable jobs are not separate runs'}
[IO.File]::WriteAllText((Join-Path $out 'metrics-source.json'),($result|ConvertTo-Json -Depth 15),[Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllText((Join-Path $out 'review-chain.json'),($reviews.ToArray()|ConvertTo-Json -Depth 15),[Text.UTF8Encoding]::new($false))
$result | ConvertTo-Json -Depth 10
