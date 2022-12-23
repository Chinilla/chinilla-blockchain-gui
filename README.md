# chinilla-blockchain-gui

![Chinilla logo](https://www.chinilla.com/wp-content/uploads/2022/09/chinilla-logo.svg)

![GitHub contributors](https://img.shields.io/github/contributors/Chinilla/chinilla-blockchain-gui?logo=GitHub)

Welcome to the Chinilla GUI repo!

Chinilla GUI is written in TypeScript and uses Electron/React.

This monorepo consists of the following packages:

| Package name  | Description                                                                                                |
| ------------- | ---------------------------------------------------------------------------------------------------------- |
| **api**       | JS/TS library to access the Chinilla Blockchain RPC                                                            |
| **api-react** | React library that wraps **api** in hooks                                                                  |
| **core**      | Common React components and hooks                                                                          |
| **gui**       | The actual GUI package. It uses our packages like **api-react** and **core** under the hood                |
| **icons**     | Chinilla specific icons                                                                                        |
| **wallets**   | Common React components and hooks. Do not use this in you project. Will be merged to **core** package soon |

## Development

1. This repo (chinilla-blockchain-gui) must be under chinilla-blockchain repo. Please follow the [installation steps for the chinilla-blockchain](https://github.com/Chinilla/chinilla-blockchain/wiki/INSTALL#install-from-source). Make sure to install from source code (git clone...).
2. Run the `sh install-gui.sh` as instructed in the previous step. This will clone the chinilla-blockchain-gui under chinilla-blockchain repo.
3. Run `npm run dev:gui`

When developing, please:

- Only edit the code via the **Vscode editor**.
- Always have **chinilla-blockchain-gui opened as a root folder in the Vscode** and not chinilla-blockchain, or chinilla-blockchain-gui/packages/... Failing to do so will result in incorrect auto linting and auto formatting which would not go trough the CI quality checks.
- When you open the repo in the vscode, click on "Install recommended plugins" pop-up.
- To develop in testnet, please follow [these steps](https://github.com/Chinilla/chinilla-blockchain/wiki/How-to-connect-to-the-Testnet).
- Git branch from "main"
- Please write tests for your code
- When disabling an eslint rule, please provide a reason after two dashes (--), example:

  `// eslint-disable-next-line react-hooks/exhaustive-deps -- Some dependencies intentionally left out`

## Localization

Do not edit files directly in the repo, but instead please head over to our [Crowdin project](https://crowdin.com/project/chinilla-blockchain/) and add/edit translations there.

## FAQ/WIKI

Please check out the [wiki](https://github.com/Chinilla/chinilla-blockchain/wiki)
and [FAQ](https://github.com/Chinilla/chinilla-blockchain/wiki/FAQ) for
information on this project.
