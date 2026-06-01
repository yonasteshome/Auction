import os
import subprocess
import zipfile

repo_dir = r'C:\Users\hp\Downloads\Auction_silver_ready\auction_fixed'
if not os.path.isdir(repo_dir):
    raise RuntimeError(f'Repo directory not found: {repo_dir}')

repo_name = ''
try:
    url = subprocess.check_output(['git', 'remote', 'get-url', 'origin'], text=True).strip()
    repo_name = url.rstrip('/').split('/')[-1]
    if repo_name.endswith('.git'):
        repo_name = repo_name[:-4]
except Exception:
    repo_name = ''
if not repo_name:
    repo_name = os.path.basename(repo_dir)

zip_name = repo_name + '.zip'
zip_path = os.path.join(os.path.dirname(repo_dir), zip_name)

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(repo_dir):
        for f in files:
            fp = os.path.join(root, f)
            rel = os.path.relpath(fp, repo_dir)
            arc = rel.replace('\\', '/')
            z.write(fp, arc)

print('ZIP_PATH:' + zip_path)
print('SIZE_BYTES:' + str(os.path.getsize(zip_path)))
with zipfile.ZipFile(zip_path) as zf:
    print('ENTRIES:' + str(len(zf.infolist())))
    print('FIRST_20:' + str(zf.namelist()[:20]))
    git_entries = [n for n in zf.namelist() if n.startswith('.git/') or n == '.git']
    print('GIT_ENTRIES:' + str(len(git_entries)))
    print('GIT_FIRST_20:' + str(git_entries[:20]))
