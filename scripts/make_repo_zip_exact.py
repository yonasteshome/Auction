import os
import zipfile

repo_dir = r'C:\Users\hp\Downloads\Auction_silver_ready\auction_fixed'
zip_name = 'auction_fixed.zip'
zip_path = os.path.join(os.path.dirname(repo_dir), zip_name)

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(repo_dir):
        for f in files:
            fp = os.path.join(root, f)
            rel = os.path.relpath(fp, repo_dir)
            arc = rel.replace('\\', '/')
            z.write(fp, arc)

print(zip_path)
print(os.path.getsize(zip_path))
with zipfile.ZipFile(zip_path) as zf:
    git_entries = [n for n in zf.namelist() if n.startswith('.git/') or n == '.git']
    print('git_entries', len(git_entries))
    print('sample', git_entries[:10])
