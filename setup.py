#! /usr/bin/env python
import setuptools

def setup():
    setuptools.setup(
        cmdclass = {
            'compile_proto': CompileProtoCommand,
            'clean': CleanThirdparties,
        },
    )

#=============================================================================
import distutils.cmd
import distutils.log
import logging
import subprocess
import distutils
from pathlib import Path

FORMAT = '%(asctime)-15s %(message)s'
logging.basicConfig(format=FORMAT, level=logging.INFO)

logger = logging.getLogger(__name__)
logging.getLogger('pip').setLevel(logging.INFO) # ensure progressbar


import re
def _file_textreplace(file, replacements):
    replacements = [(re.compile(p), n) for p, n in replacements.items()]

    lines = []
    with open(file) as infile:
        for line in infile:
            for ptn, repl  in replacements:
                line = ptn.sub(repl, line)
            lines.append(line)

    with open(file, 'w') as outfile:
        for line in lines:
            outfile.write(line)

class CompileProtoCommand(distutils.cmd.Command):
    """Custom build command."""
    description = 'Compile etcd grpc proto files'
    user_options = [ # (long option, short option, description)
    ]

    files = [
        ('.', 'etcd/mvcc/mvccpb/kv.proto'),
        ('.', 'etcd/auth/authpb/auth.proto'),
        ('.', 'etcd/etcdserver/etcdserverpb/rpc.proto'),
        ('gogoproto', 'gogoproto/gogo.proto'),
        ('googleapis', 'google/api/http.proto'),
        ('googleapis', 'google/api/annotations.proto'),
    ]

    thirdparties = {
        "etcd" : 'https://github.com/coreos/etcd/archive/master.zip',
        "gogoproto": "https://github.com/gogo/protobuf/archive/master.zip",
        "googleapis": "https://github.com/googleapis/googleapis/archive/master.zip",
    }

    def initialize_options(self):
        """Set default values for options."""

    def finalize_options(self):
        """Post-process options."""

    def run(self):

        thirdparties_dir = Path('build') / 'thirdparties'
        dst_dir = Path('asyncetcd/_stubs')

        # download and unpack the thirdparty resources
        unpack_zipfiles(self.thirdparties, thirdparties_dir)

        # collect the proto files from thirdparties
        for src_dir, file in self.files:
            src_file = thirdparties_dir / src_dir / file
            dst_file = dst_dir / file
            self.mkpath(str(dst_file.parent))
            self.copy_file(str(src_file), str(dst_file))

        # protoc compile the proto files
        from grpc_tools import command as grpc_tools_cmd
        grpc_tools_cmd.build_package_protos(str(dst_dir))

        # substitute the package namespace, prefixed with 'aio_etcd3._stubs'
        import os
        for root, dirs, files in os.walk(dst_dir):
            root = Path(root)
            for file in files:
                if not file.endswith('.py'):
                    continue

                _file_textreplace(root / file, {
                    r'from etcd': r'from asyncetcd._stubs.etcd',
                    r'from gogoproto': r'from asyncetcd._stubs.gogoproto',
                    r'from google\.api': r'from asyncetcd._stubs.google.api',
                })

def unpack_zipfiles(zipfiles, location):
    location = Path(location)
    import pip
    for prj_id, url in zipfiles.items():
        download_flag = location / ('downloaded_' + prj_id)
        if download_flag.exists():
            logger.info('Skipped: downloading ' + str(url))
            continue

        pip.download.unpack_url(pip.index.Link(url), location / prj_id)
        with open(download_flag, 'w') as outfile:
            outfile.write(url)

import distutils.command.clean
class CleanThirdparties(distutils.command.clean.clean):

    def run(self):
        path = Path('build') / 'thirdparties'
        if path.exists():
            distutils.dir_util.remove_tree(path)

        super().run()

#-------------------------------------------------------------------------
if __name__ == '__main__':
    setup()
