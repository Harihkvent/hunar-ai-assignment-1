import sys
from pathlib import Path

# Add backend directory and project root to sys.path
backend_dir = Path(__file__).resolve().parent.parent
project_root = backend_dir.parent

for p in [str(project_root), str(backend_dir)]:
    if p not in sys.path:
        sys.path.insert(0, p)
