const fs = require('fs');

async function deployOutputToABranch(branchDeploy = 'master', buildFolder = 'dist') {
  // Check temporary directory have been already existed or not
  const temporaryDirectory = 'temp';
  const existed = fs.existsSync(temporaryDirectory);
  if (existed) {
    await $`rm -rf ./${temporaryDirectory}`;
  }

  // Clone our repository with temporary name in deployment branch
  const remoteHost = (await $`git config --get remote.origin.url`).stdout.trim();
  await $`git clone --branch ${branchDeploy}  ${remoteHost} ${temporaryDirectory}`;

  // Replace all of source code in this directory by source code in output directory
  await $`rm -rf ./${temporaryDirectory}/*`;
  await $`cp -a ./${buildFolder}/. ./${temporaryDirectory}/`;

  cd(`./${temporaryDirectory}`);
  const haveFileChanges = (await $`git ls-files --others -d -m`).stdout.trim();
  if (!haveFileChanges) {
    // Show messages stop function
    console.log('No changes');
  } else {
    // Add, commit and push that changes to deployment branch
    await $`git add .`;
    await $`git commit -m "push any commit message you want to"`;
    await $`git push origin ${branchDeploy}`;
  }
  cd('..');

  // Clean up
  await $`rm -rf ./${temporaryDirectory}`;
}

deployOutputToABranch('master', 'dist');