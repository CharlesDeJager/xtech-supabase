# data wrangler package.json

```json
"packageJSON": {
    "id": "ms-toolsai.datawrangler",
    "identifier": {
      "value": "ms-toolsai.datawrangler",
      "_lower": "ms-toolsai.datawrangler"
    },
    "isBuiltin": false,
    "isUserBuiltin": false,
    "isUnderDevelopment": false,
    "extensionLocation": {
      "$mid": 1,
      "fsPath": "/Users/charlesdejager/.vscode/extensions/ms-toolsai.datawrangler-1.24.0",
      "path": "/Users/charlesdejager/.vscode/extensions/ms-toolsai.datawrangler-1.24.0",
      "scheme": "file"
    },
    "uuid": "de3960e6-b262-4565-8a1c-9870629f1ed9",
    "targetPlatform": "undefined",
    "publisherDisplayName": "Microsoft",
    "preRelease": false,
    "private": true,
    "name": "datawrangler",
    "displayName": "Data Wrangler",
    "version": "1.24.0",
    "description": "Data viewing, cleaning and preparation for tabular datasets",
    "publisher": "ms-toolsai",
    "author": {
      "name": "Microsoft Corporation"
    },
    "license": "SEE LICENSE IN LICENSE.txt",
    "homepage": "https://github.com/microsoft/vscode-data-wrangler",
    "bugs": {
      "url": "https://github.com/microsoft/vscode-data-wrangler/issues"
    },
    "repository": {
      "type": "git",
      "url": "https://github.com/microsoft/vscode-data-wrangler"
    },
    "galleryBanner": {
      "color": "#ffffff",
      "theme": "light"
    },
    "engines": {
      "vscode": "^1.82.0"
    },
    "keywords": [
      "jupyterVariableViewers",
      "data",
      "data quality",
      "data viewer",
      "data editor",
      "data import",
      "data export",
      "ETL",
      "Data Science",
      "data cleaning",
      "data cleansing",
      "data wrangling",
      "data visualization",
      "data analysis",
      "data exploration",
      "data summary",
      "data transformation",
      "data prep",
      "data preparation",
      "Exploratory Data Analysis",
      "EDA",
      "Business Intelligence",
      "insights",
      "graphs",
      "charts",
      "plots",
      "visualization",
      "Jupyter",
      "Jupyter Notebook",
      "csv",
      "tsv",
      "parquet",
      "power query",
      "Stata",
      "Excel",
      "xls",
      "xlsx",
      "jsonl",
      "dataset",
      "DataFrame",
      "data frame",
      "data table",
      "table",
      "grid",
      "spreadsheet",
      "python",
      "numpy",
      "pandas",
      "code generation",
      "code generator"
    ],
    "categories": [
      "Data Science",
      "Machine Learning"
    ],
    "activationEvents": [
      "onNotebook:jupyter-notebook",
      "onNotebook:interactive",
      "onLanguage:python"
    ],
    "main": "./out/extension.js",
    "browser": "./out/extension.web.bundle.js",
    "l10n": "./l10n",
    "enabledApiProposals": [],
    "icon": "media/icon_128.png",
    "contributes": {
      "jupyterVariableViewers": [
        {
          "command": "dataWrangler.launchDataViewer",
          "title": "Launch in Data Wrangler",
          "dataTypes": [
            "DataFrame",
            "list",
            "dict",
            "ndarray",
            "Series",
            "Tensor",
            "EagerTensor",
            "DataArray"
          ]
        }
      ],
      "languages": [
        {
          "id": "data-wrangler",
          "extensions": [
            "- Data Wrangler",
            "[DW]"
          ],
          "icon": {
            "light": "media/icon_128.png",
            "dark": "media/icon_128.png"
          }
        }
      ],
      "icons": {
        "data-wrangler": {
          "description": "Data Wrangler icon",
          "default": {
            "fontPath": "media/iconfont.woff",
            "fontCharacter": "D"
          }
        }
      },
      "keybindings": [
        {
          "command": "dataWrangler.undoOperation",
          "key": "ctrl+z",
          "mac": "cmd+z",
          "when": "dataWrangler.canUndoOperation && dataWrangler.dataWranglerActive && dataWrangler.focusedElementAllowsShortcuts && !inputFocus && isWorkspaceTrusted"
        },
        {
          "command": "dataWrangler.applyOperation",
          "key": "shift+enter",
          "when": "dataWrangler.canApplyOperation && dataWrangler.dataWranglerActive && dataWrangler.focusedElementAllowsShortcuts && !inputFocus && isWorkspaceTrusted"
        },
        {
          "command": "dataWrangler.discardOperation",
          "key": "escape",
          "when": "dataWrangler.canDiscardOperation && dataWrangler.dataWranglerActive && dataWrangler.focusedElementAllowsShortcuts && !inputFocus && isWorkspaceTrusted"
        },
        {
          "command": "dataWrangler.revealNL2CodeWidget",
          "key": "ctrl+i",
          "mac": "cmd+i",
          "when": "dataWrangler.canRevealNL2CodeWidget && dataWrangler.dataWranglerActive && dataWrangler.focusedElementAllowsShortcuts && !inputFocus && isWorkspaceTrusted"
        }
      ],
      "commands": [
        {
          "command": "dataWrangler.reportIssue",
          "title": "Report issue",
          "category": "Data Wrangler",
          "enablement": "(dataWrangler.dataWranglerActive || dataWrangler.dataViewerActive || dataWrangler.outputRendererActive) && isWorkspaceTrusted"
        },
        {
          "command": "dataWrangler.clearCachedKernel",
          "title": "Clear cached runtime",
          "category": "Data Wrangler",
          "enablement": "isWorkspaceTrusted"
        },
        {
          "command": "dataWrangler.changeKernel",
          "title": "Change selected runtime",
          "category": "Data Wrangler",
          "enablement": "dataWrangler.dataWranglerActive && isWorkspaceTrusted"
        },
        {
          "command": "dataWrangler.openInDataWrangler",
          "title": "Open in Data Wrangler",
          "icon": "$(data-wrangler)",
          "category": "Data Wrangler",
          "enablement": "isWorkspaceTrusted"
        },
        {
          "command": "dataWrangler.applyOperation",
          "title": "Apply step",
          "category": "Data Wrangler",
          "enablement": "dataWrangler.canApplyOperation && dataWrangler.dataWranglerActive && isWorkspaceTrusted"
        },
        {
          "command": "dataWrangler.discardOperation",
          "title": "Discard step",
          "category": "Data Wrangler",
          "enablement": "dataWrangler.canDiscardOperation && dataWrangler.dataWranglerActive && isWorkspaceTrusted"
        },
        {
          "command": "dataWrangler.previewOperation",
          "title": "Perform operation",
          "category": "Data Wrangler",
          "enablement": "dataWrangler.canPreviewOperation && dataWrangler.dataWranglerActive && isWorkspaceTrusted"
        },
        {
          "command": "dataWrangler.undoOperation",
          "title": "Undo step",
          "category": "Data Wrangler",
          "enablement": "dataWrangler.canUndoOperation && dataWrangler.dataWranglerActive && isWorkspaceTrusted"
        },
        {
          "command": "dataWrangler.runPerformanceTests",
          "title": "Run performance tests",
          "category": "Data Wrangler",
          "enablement": "!isWeb && isWorkspaceTrusted && config.dataWrangler.debug"
        },
        {
          "command": "dataWrangler.showTelemetryData",
          "title": "Show telemetry data",
          "category": "Data Wrangler",
          "enablement": "(dataWrangler.dataWranglerActive || dataWrangler.dataViewerActive) && isWorkspaceTrusted && config.dataWrangler.debug"
        },
        {
          "command": "dataWrangler.openSettings",
          "title": "Data Wrangler Settings",
          "category": "Data Wrangler",
          "icon": "$(settings-gear)"
        },
        {
          "command": "dataWrangler.openExperiments",
          "title": "Data Wrangler Experiments",
          "category": "Data Wrangler",
          "icon": "$(beaker)"
        },
        {
          "command": "dataWrangler.openFile",
          "title": "Open File",
          "category": "Data Wrangler",
          "enablement": "!isWeb"
        },
        {
          "command": "dataWrangler.walkthroughCsv",
          "title": "Open Walkthrough CSV file",
          "category": "Data Wrangler",
          "enablement": "!isWeb"
        },
        {
          "command": "dataWrangler.openWalkthrough",
          "title": "Open Walkthrough",
          "category": "Data Wrangler",
          "icon": "$(book)"
        },
        {
          "command": "dataWrangler.revealSourceFileInFileExplorer",
          "title": "Reveal Source File in Explorer View",
          "category": "Data Wrangler",
          "enablement": "(dataWrangler.dataWranglerActive || dataWrangler.dataViewerActive) && isWorkspaceTrusted"
        },
        {
          "command": "dataWrangler.openNotebookVariable",
          "title": "View data",
          "category": "Data Wrangler",
          "enablement": "notebookKernel =~ /^ms-toolsai.jupyter\\// && isWorkspaceTrusted",
          "icon": "$(data-wrangler)"
        },
        {
          "command": "dataWrangler.dataViewerClearSorts",
          "title": "Clear sorts",
          "category": "Data Wrangler",
          "enablement": "dataWrangler.dataViewerActive && isWorkspaceTrusted",
          "icon": "$(trash)"
        },
        {
          "command": "dataWrangler.dataViewerClearFilters",
          "title": "Clear filters",
          "category": "Data Wrangler",
          "enablement": "dataWrangler.dataViewerActive && isWorkspaceTrusted",
          "icon": "$(trash)"
        },
        {
          "command": "dataWrangler.openSourceFileInBasicEditor",
          "title": "Open Source File in Basic Editor",
          "category": "Data Wrangler",
          "enablement": "(dataWrangler.dataWranglerActive || dataWrangler.dataViewerActive) && dataWrangler.isSessionFromFile && isWorkspaceTrusted",
          "icon": "$(go-to-file)"
        }
      ],
      "customEditors": [
        {
          "viewType": "jupyter-data-wrangler",
          "displayName": "Data Wrangler",
          "selector": [
            {
              "filenamePattern": "{*.csv,*.tsv,*.parquet,*.xls,*.xlsx,*.jsonl}"
            }
          ],
          "priority": "option"
        }
      ],
      "notebookRenderer": [
        {
          "id": "microsoft.datawrangler-renderer",
          "entrypoint": "./out/notebookOutputRenderer.bundle.js",
          "displayName": "Data Wrangler renderer",
          "mimeTypes": [
            "application/vnd.microsoft.datawrangler.viewer.v0+json"
          ],
          "requiresMessaging": "always",
          "dependencies": []
        }
      ],
      "views": {
        "data-wrangler-primary": [
          {
            "type": "webview",
            "id": "jupyter-data-wrangler-operations-view",
            "name": "Operations",
            "when": "dataWrangler.dataWranglerActive && isWorkspaceTrusted"
          },
          {
            "type": "webview",
            "id": "jupyter-data-wrangler-summary-view",
            "name": "Data summary",
            "when": "(dataWrangler.dataWranglerActive || dataWrangler.dataViewerActive) && isWorkspaceTrusted"
          },
          {
            "type": "webview",
            "id": "jupyter-data-wrangler-cleaning-steps-view",
            "name": "Cleaning steps",
            "when": "dataWrangler.dataWranglerActive && isWorkspaceTrusted"
          },
          {
            "type": "webview",
            "id": "data-viewer-filters-view",
            "name": "Filters",
            "visibility": "collapsed",
            "when": "dataWrangler.dataViewerActive && isWorkspaceTrusted"
          },
          {
            "type": "webview",
            "id": "data-viewer-sorts-view",
            "name": "Sorts",
            "visibility": "collapsed",
            "when": "dataWrangler.dataViewerActive && isWorkspaceTrusted"
          }
        ],
        "data-wrangler-secondary": [
          {
            "type": "webview",
            "id": "jupyter-data-wrangler-code-preview-view",
            "name": "Code preview",
            "when": "dataWrangler.dataWranglerActive && isWorkspaceTrusted"
          }
        ]
      },
      "viewsContainers": {
        "activitybar": [
          {
            "id": "data-wrangler-primary",
            "title": "Data Wrangler",
            "icon": "$(data-wrangler)"
          }
        ],
        "panel": [
          {
            "id": "data-wrangler-secondary",
            "title": "Data Wrangler",
            "icon": "$(data-wrangler)"
          }
        ]
      },
      "menus": {
        "commandPalette": [
          {
            "command": "dataWrangler.openInDataWrangler",
            "when": "!isWeb && ((resourceExtname == .csv && config.dataWrangler.enabledFileTypes.csv) || (resourceExtname == .tsv && config.dataWrangler.enabledFileTypes.tsv) || (resourceExtname == .parquet && config.dataWrangler.enabledFileTypes.parquet) || (resourceExtname == .xlsx && config.dataWrangler.enabledFileTypes.xlsx) || (resourceExtname == .xls && config.dataWrangler.enabledFileTypes.xls) || (resourceExtname == .jsonl && config.dataWrangler.enabledFileTypes.jsonl))",
            "group": "navigation"
          },
          {
            "command": "dataWrangler.runPerformanceTests"
          }
        ],
        "editor/title": [
          {
            "command": "dataWrangler.openInDataWrangler",
            "when": "!isWeb && ((resourceExtname == .csv && config.dataWrangler.enabledFileTypes.csv) || (resourceExtname == .tsv && config.dataWrangler.enabledFileTypes.tsv) || (resourceExtname == .parquet && config.dataWrangler.enabledFileTypes.parquet) || (resourceExtname == .xlsx && config.dataWrangler.enabledFileTypes.xlsx) || (resourceExtname == .xls && config.dataWrangler.enabledFileTypes.xls)  || (resourceExtname == .jsonl && config.dataWrangler.enabledFileTypes.jsonl))",
            "group": "navigation"
          },
          {
            "command": "dataWrangler.openSourceFileInBasicEditor",
            "when": "(dataWrangler.dataWranglerActive || dataWrangler.dataViewerActive) && dataWrangler.isSessionFromFile",
            "group": "navigation"
          },
          {
            "command": "dataWrangler.openWalkthrough",
            "group": "navigation@1",
            "when": "dataWrangler.dataWranglerActive || dataWrangler.dataViewerActive"
          },
          {
            "command": "dataWrangler.openSettings",
            "group": "navigation@2",
            "when": "dataWrangler.dataWranglerActive || dataWrangler.dataViewerActive"
          },
          {
            "command": "dataWrangler.openExperiments",
            "group": "navigation@3",
            "when": "dataWrangler.dataWranglerActive || dataWrangler.dataViewerActive"
          }
        ],
        "editor/title/context": [
          {
            "command": "dataWrangler.openInDataWrangler",
            "when": "!isWeb && ((resourceExtname == .csv && config.dataWrangler.enabledFileTypes.csv) || (resourceExtname == .tsv && config.dataWrangler.enabledFileTypes.tsv) || (resourceExtname == .parquet && config.dataWrangler.enabledFileTypes.parquet) || (resourceExtname == .xlsx && config.dataWrangler.enabledFileTypes.xlsx) || (resourceExtname == .xls && config.dataWrangler.enabledFileTypes.xls) || (resourceExtname == .jsonl && config.dataWrangler.enabledFileTypes.jsonl))",
            "group": "navigation"
          }
        ],
        "explorer/context": [
          {
            "command": "dataWrangler.openInDataWrangler",
            "when": "!isWeb && ((resourceExtname == .csv && config.dataWrangler.enabledFileTypes.csv) || (resourceExtname == .tsv && config.dataWrangler.enabledFileTypes.tsv) || (resourceExtname == .parquet && config.dataWrangler.enabledFileTypes.parquet) || (resourceExtname == .xlsx && config.dataWrangler.enabledFileTypes.xlsx) || (resourceExtname == .xls && config.dataWrangler.enabledFileTypes.xls) || (resourceExtname == .jsonl && config.dataWrangler.enabledFileTypes.jsonl))",
            "group": "navigation"
          }
        ],
        "notebook/toolbar": [
          {
            "command": "dataWrangler.openNotebookVariable",
            "when": "notebookKernel =~ /^ms-toolsai.jupyter\\// && notebookType == 'jupyter-notebook' && isWorkspaceTrusted && jupyter.ispythonnotebook && jupyter.kernel.isjupyter",
            "group": "navigation"
          }
        ],
        "interactive/toolbar": [
          {
            "command": "dataWrangler.openNotebookVariable",
            "when": "isWorkspaceTrusted && notebookKernel =~ /^ms-toolsai.jupyter\\// || isWorkspaceTrusted && !notebookKernel",
            "group": "navigation"
          }
        ],
        "view/title": [
          {
            "command": "dataWrangler.dataViewerClearSorts",
            "when": "view == data-viewer-sorts-view"
          },
          {
            "command": "dataWrangler.dataViewerClearFilters",
            "when": "view == data-viewer-filters-view"
          }
        ]
      },
      "configuration": [
        {
          "type": "object",
          "title": "Data Wrangler",
          "properties": {
            "dataWrangler.startInEditModeForNotebookEntrypoints": {
              "type": "boolean",
              "default": false,
              "description": "Opens data directly in editing mode when entering from a Jupyter notebook file."
            },
            "dataWrangler.columnInsights.displayOnOpen": {
              "type": "boolean",
              "default": true,
              "description": "Whether to display the column insights the moment a dataset is loaded."
            },
            "dataWrangler.useRelativePath": {
              "type": "boolean",
              "default": false,
              "description": "Enable path resolution for local files relative to the root directory of the connection. Note that this setting only applies to local interpreter connections."
            },
            "dataWrangler.debug": {
              "type": "boolean",
              "default": false,
              "description": "Enable debugging features for troubleshooting the Data Wrangler extension."
            },
            "dataWrangler.enabledFileTypes": {
              "type": "object",
              "additionalProperties": false,
              "properties": {
                "csv": {
                  "type": "boolean",
                  "description": "Comma-separated values"
                },
                "tsv": {
                  "type": "boolean",
                  "description": "Tab-separated values"
                },
                "parquet": {
                  "type": "boolean",
                  "description": "Apache Parquet"
                },
                "xlsx": {
                  "type": "boolean",
                  "description": "Excel workbook"
                },
                "xls": {
                  "type": "boolean",
                  "description": "Excel 97-2003 workbook"
                },
                "jsonl": {
                  "type": "boolean",
                  "description": "JSON Lines"
                }
              },
              "default": {
                "csv": true,
                "tsv": true,
                "parquet": true,
                "xlsx": true,
                "xls": true,
                "jsonl": true
              },
              "description": "File extensions to offer to open with Data Wrangler."
            },
            "dataWrangler.defaultViewingFilterOptions": {
              "type": "string",
              "default": "basic",
              "enum": [
                "basic",
                "advanced"
              ],
              "enumItemLabels": [
                "Basic mode",
                "Advanced mode"
              ],
              "description": "Default filter mode to use when in viewing mode."
            },
            "dataWrangler.grid.defaultColumnWidth": {
              "type": "integer",
              "default": 200,
              "minimum": 80,
              "description": "The default width of a column in pixels."
            },
            "dataWrangler.panels.displayOnTabFocus": {
              "type": "boolean",
              "default": true,
              "description": "Whether to reveal Data Wrangler panels when the tab is focused (either from launching or from tab switching). Note that some panels may still be shown if required, e.g., if an error occurs while loading.",
              "tags": [
                "experimental"
              ]
            },
            "dataWrangler.outputRenderer.enabled": {
              "type": "boolean",
              "default": false,
              "markdownDescription": "Enable the Data Wrangler output viewer.",
              "tags": [
                "experimental",
                "onExP"
              ]
            },
            "dataWrangler.outputRenderer.columnInsights.displayByDefault": {
              "type": "boolean",
              "default": false,
              "markdownDescription": "Display column insights immediately when the output viewer is shown (if insights are available).",
              "tags": [
                "experimental",
                "onExP"
              ]
            },
            "dataWrangler.outputRenderer.pagination.defaultSize": {
              "type": "number",
              "default": 10,
              "enum": [
                10,
                25,
                50
              ],
              "markdownDescription": "Default page size for the output viewer.",
              "tags": [
                "experimental",
                "onExP"
              ]
            },
            "dataWrangler.outputRenderer.enabledTypes": {
              "type": "object",
              "additionalProperties": false,
              "properties": {
                "pandas.core.frame.DataFrame": {
                  "type": "boolean",
                  "description": "Pandas DataFrame"
                },
                "pandas.core.series.Series": {
                  "type": "boolean",
                  "description": "Pandas Series"
                },
                "numpy.ndarray": {
                  "type": "boolean",
                  "description": "Numpy NDarray"
                },
                "builtins.list": {
                  "type": "boolean",
                  "description": "List"
                },
                "builtins.dict": {
                  "type": "boolean",
                  "description": "Dictionary"
                },
                "torch.Tensor": {
                  "type": "boolean",
                  "description": "Torch Tensor"
                },
                "tensorflow.python.framework.ops.EagerTensor": {
                  "type": "boolean",
                  "description": "TensorFlow EagerTensor"
                },
                "xarray.core.dataarray.DataArray": {
                  "type": "boolean",
                  "description": "XArray DataArray"
                },
                "polars.dataframe.frame.DataFrame": {
                  "type": "boolean",
                  "description": "Polars DataFrame"
                },
                "polars.series.series.Series": {
                  "type": "boolean",
                  "description": "Polars Series"
                },
                "pyspark.sql.dataframe.DataFrame": {
                  "type": "boolean",
                  "description": "PySpark DataFrame"
                },
                "pyspark.sql.connect.dataframe.DataFrame": {
                  "type": "boolean",
                  "description": "PySpark Connect DataFrame"
                }
              },
              "default": {
                "pandas.core.frame.DataFrame": true,
                "pandas.core.series.Series": true,
                "numpy.ndarray": false,
                "builtins.list": false,
                "builtins.dict": false,
                "torch.Tensor": false,
                "tensorflow.python.framework.ops.EagerTensor": false,
                "xarray.core.dataarray.DataArray": false,
                "polars.dataframe.frame.DataFrame": false,
                "polars.series.series.Series": false,
                "pyspark.sql.dataframe.DataFrame": false,
                "pyspark.sql.connect.dataframe.DataFrame": false
              },
              "markdownDescription": "Output types to show the custom Data Wrangler renderer. WARNING: these are converted to Pandas for viewing which can be slow for some datasets, so enable at your own risk. If conversion fails, the default renderer will be used instead.",
              "tags": [
                "experimental",
                "onExP"
              ]
            }
          }
        },
        {
          "title": "Experiments",
          "properties": {
            "dataWrangler.experiments.fastCsvParsing": {
              "type": "boolean",
              "default": false,
              "markdownDescription": "**Experimental** enable fast CSV parsing using the PyArrow engine. Requires the `pyarrow` package and `pandas>=1.4.0`. [Read more about PyArrow support in Pandas](https://pandas.pydata.org/pandas-docs/stable/user_guide/io.html#specifying-the-parser-engine).",
              "tags": [
                "experimental"
              ]
            },
            "dataWrangler.experiments.autoDetectCsvDelimiter": {
              "type": "boolean",
              "default": false,
              "markdownDescription": "**Experimental** automatically detect the delimiter when opening CSV files.",
              "tags": [
                "experimental"
              ]
            },
            "dataWrangler.experiments.datatypes.pyspark": {
              "type": "boolean",
              "default": false,
              "markdownDescription": "**Experimental** allow loading from PySpark DataFrame variables.",
              "tags": [
                "preview"
              ]
            },
            "dataWrangler.experiments.copilot.enabled": {
              "type": "boolean",
              "default": false,
              "markdownDescription": "**Experimental** enable Copilot powered features in Data Wrangler. Note that this feature requires both the [GitHub Copilot Chat VS Code extension](command:extension.open?%5B%22github.copilot-chat%22%5D) and having an active [Copilot Subscription](https://github.com/features/copilot).",
              "tags": [
                "preview",
                "onExP"
              ]
            }
          }
        }
      ],
      "walkthroughs": [
        {
          "id": "dataWranglerWelcome",
          "title": "Get started with Data Wrangler",
          "description": "Start cleaning data with Pandas and Python in only a few steps.",
          "when": "workspacePlatform != webworker",
          "steps": [
            {
              "id": "openDataWrangler",
              "title": "Step 1: Open Data Wrangler",
              "description": "**From a Jupyter Notebook:** A button with the Data Wrangler logo should appear right above the output of code that displays dataframe, such as ``df.head()``. \n**From the file explorer of Visual Studio Code:** Right click a CSV file to open it with Data Wrangler.\n[Open file in Data Wrangler](command:dataWrangler.openFile)\n🔎 Check out our [docs](https://github.com/microsoft/vscode-data-wrangler) to learn more.",
              "media": {
                "image": {
                  "dark": "media/walkthrough/openDataWrangler-dark.svg",
                  "light": "media/walkthrough/openDataWrangler-light.svg",
                  "hc": "media/walkthrough/openDataWrangler-dark.svg",
                  "hcLight": "media/walkthrough/openDataWrangler-light.svg"
                },
                "altText": "Entrypoints to Data Wrangler"
              },
              "when": "!isWeb"
            },
            {
              "id": "openDataWrangler-web-variant",
              "title": "Step 1: Open Data Wrangler",
              "description": "**From a Jupyter Notebook:** A button with the Data Wrangler logo should appear right above the output of code that displays a dataframe, such as ``df.head()``. \n🔎 Check out our [docs](https://github.com/microsoft/vscode-data-wrangler) to learn more.",
              "media": {
                "image": {
                  "dark": "media/walkthrough/openDataWrangler-dark.svg",
                  "light": "media/walkthrough/openDataWrangler-light.svg",
                  "hc": "media/walkthrough/openDataWrangler-dark.svg",
                  "hcLight": "media/walkthrough/openDataWrangler-light.svg"
                },
                "altText": "Entrypoints to Data Wrangler"
              },
              "when": "isWeb"
            },
            {
              "id": "cleanDataUsingOperations",
              "title": "Step 2: Clean data using operations",
              "description": "Browse the list of built-in data cleaning operations or write your own using the code editor. The data grid will update with a live preview of what changed.\n🧪 **Tip:** Try out our [experiments](command:dataWrangler.openExperiments) to enable new features.",
              "media": {
                "image": {
                  "dark": "media/walkthrough/cleanDataUsingOperations-dark.svg",
                  "light": "media/walkthrough/cleanDataUsingOperations-light.svg",
                  "hc": "media/walkthrough/cleanDataUsingOperations-dark.svg",
                  "hcLight": "media/walkthrough/cleanDataUsingOperations-light.svg"
                },
                "altText": "Diff of a drop column operation"
              }
            },
            {
              "id": "applyYourChanges",
              "title": "Step 3: Apply your changes",
              "description": "✔ Review the generated code in the bottom code panel.\n✔ Apply the operation to add it to your list of cleaning steps.\n✔ Undo or edit your last operation in the \"Cleaning Steps\" panel.\n🔎 **Tip:** Try clicking \"Preview code for all steps\" in the Cleaning Steps panel.",
              "media": {
                "image": {
                  "dark": "media/walkthrough/applyYourChanges-dark.svg",
                  "light": "media/walkthrough/applyYourChanges-light.svg",
                  "hc": "media/walkthrough/applyYourChanges-dark.svg",
                  "hcLight": "media/walkthrough/applyYourChanges-light.svg"
                },
                "altText": "Operation committed"
              }
            },
            {
              "id": "exportYourCode",
              "title": "Step 4: Export your code or data",
              "description": "At the top, you'll find buttons to export all the code back to your notebook, create a script or save the clean data as a CSV.",
              "media": {
                "image": {
                  "dark": "media/walkthrough/exportYourCode-dark.svg",
                  "light": "media/walkthrough/exportYourCode-light.svg",
                  "hc": "media/walkthrough/exportYourCode-dark.svg",
                  "hcLight": "media/walkthrough/exportYourCode-light.svg"
                },
                "altText": "Export back to notebook"
              }
            },
            {
              "id": "openTitanicCSV",
              "title": "Try with the Titanic dataset",
              "description": "Try Data Wrangler with the Titanic dataset from Kaggle\n[Open the Titanic dataset](command:dataWrangler.walkthroughCsv)\n🔎 Check out our [docs](https://github.com/microsoft/vscode-data-wrangler) to learn more.",
              "media": {
                "image": {
                  "dark": "media/walkthrough/openTitanicCSV-dark.svg",
                  "light": "media/walkthrough/openTitanicCSV-light.svg",
                  "hc": "media/walkthrough/openTitanicCSV-dark.svg",
                  "hcLight": "media/walkthrough/openTitanicCSV-light.svg"
                },
                "altText": "Open the Titanic dataset"
              },
              "completionEvents": [
                "onCommand:dataWrangler.walkthroughCsv"
              ],
              "when": "!isWeb"
            }
          ]
        }
      ],
      "languageModelTools": [
        {
          "name": "get_variable_data",
          "displayName": "Get variable data",
          "modelDescription": "Get the data for a variable",
          "inputSchema": {
            "type": "object",
            "properties": {},
            "required": []
          }
        }
      ]
    },
    "scripts": {
      "build": "npm run build:extension && npm run build:extension-web && npm run build:webviews && npm run l10n:dev:en",
      "build:extension": "webpack --config ./config/webpack.extension.config.dev.ts",
      "build:extension-web": "webpack --config ./config/webpack.extension.web.config.dev.ts",
      "build:webviews": "webpack --config ./config/webpack.webviews.config.dev.ts",
      "build:watch": "concurrently \"npm:build:watch:*\"",
      "build:watch:extension": "webpack --watch --config ./config/webpack.extension.config.dev.ts",
      "build:watch:extension-web": "webpack --watch --config ./config/webpack.extension.web.config.dev.ts",
      "build:watch:webviews": "webpack --watch --config ./config/webpack.webviews.config.dev.ts",
      "build:dogfood": "npm run build:dogfood:extension && npm run build:dogfood:extension-web && npm run build:dogfood:webviews && npm run l10n:dev:en",
      "build:dogfood:extension": "webpack --config ./config/webpack.extension.config.dogfood.ts",
      "build:dogfood:extension-web": "webpack --config ./config/webpack.extension.web.config.dogfood.ts",
      "build:dogfood:webviews": "webpack --config ./config/webpack.webviews.config.dogfood.ts",
      "build:prod": "concurrently \"npm run build:prod:*\"",
      "build:prod:extension": "webpack --config ./config/webpack.extension.config.prod.ts",
      "build:prod:extension-web": "webpack --config ./config/webpack.extension.web.config.prod.ts",
      "build:prod:webviews": "webpack --config ./config/webpack.webviews.config.prod.ts",
      "build:vscode-test": "tsc --project tsconfig.test.json",
      "build:watch:vscode-test": "tsc -w --project tsconfig.test.json --preserveWatchOutput",
      "clean": "rimraf out",
      "test:unit": "cross-env TRX_OUTPUT_NAME=test-unit.trx mocha ./**/*.unit.test.ts --reporter @dw/test-reporting/dist/mocha-reporter/index",
      "test:component": "cross-env TRX_OUTPUT_NAME=test-component.trx mocha --require global-jsdom/register ./**/*.component.test.ts? --reporter @dw/test-reporting/dist/mocha-reporter/index",
      "test:vscode": "cross-env TRX_OUTPUT_NAME=test-vscode.trx node ./out/src/test/runTest.js",
      "test:vscode:web": "cross-env IS_WEB=true TRX_OUTPUT_NAME=test-vscode-web.trx node ./out/src/test/runTest.js",
      "build-test:vscode:web": "npm run build:extension-web && npm run test:vscode:web",
      "package": "vsce package --no-dependencies --out ../ms-toolsai-data-wrangler-insiders.vsix",
      "ci:build": "npm run build && npm run build-webviews && npm run package",
      "ci:test:e2e": "npm run build:vscode-test && npm run test:vscode",
      "postinstall": "rimraf types/external && node ../build/postInstall.js",
      "l10n:dev:en": "npx @vscode/l10n-dev export --outDir ./l10n ./src",
      "l10n:dev:pseudo": "npm run l10n:dev:en && npx @vscode/l10n-dev generate-pseudo -o ./l10n/ ./l10n/bundle.l10n.json ./package.nls.json",
      "l10n:dev:clean": "rimraf l10n && rimraf --glob package.nls.*.json",
      "serve-web": "cross-env-shell \"http-server --cors -p 8000 --ssl -C $HOME/certs/localhost.pem -K $HOME/certs/localhost-key.pem\"",
      "launch-web:test": "vscode-test-web --extensionDevelopmentPath=.",
      "launch-web:vscode": "concurrently \"npm run serve-web\" \"opener https://vscode.dev\""
    },
    "extensionDependencies": [],
    "devDependencies": {
      "@dw/test-reporting": "^0.0.1-alpha.4",
      "@svgr/webpack": "^7.0.0",
      "@testing-library/react": "^13.4.0",
      "@types/fs-extra": "^11.0.3",
      "@types/lodash.clonedeep": "^4.5.8",
      "@types/markdown-it": "^14.1.2",
      "@types/mini-css-extract-plugin": "^2.5.1",
      "@types/mocha": "^10.0.3",
      "@types/node": "^18.19.50",
      "@types/node-fetch": "^2.6.2",
      "@types/react": "^18.0.27",
      "@types/react-dom": "^18.0.10",
      "@types/redux": "^3.6.0",
      "@types/semver": "^7.5.4",
      "@types/tcp-port-used": "^1.0.3",
      "@types/tmp": "^0.2.5",
      "@types/uuid": "^9.0.6",
      "@types/vscode-notebook-renderer": "^1.72.0",
      "@types/webpack": "^5.28.4",
      "@types/webpack-node-externals": "^3.0.4",
      "@types/ws": "8.5.4",
      "@vscode/debugprotocol": "^1.64.0",
      "@vscode/l10n-dev": "^0.0.35",
      "@vscode/test-electron": "^2.3.8",
      "@vscode/test-web": "^0.0.66",
      "@vscode/vsce": "^2.19.0",
      "assert": "^2.1.0",
      "axe-core": "^4.9.1",
      "colors": "^1.4.0",
      "concurrently": "^7.6.0",
      "copy-webpack-plugin": "^11.0.0",
      "cross-env": "^7.0.3",
      "css-loader": "^6.8.1",
      "file-loader": "^6.2.0",
      "glob": "^10.3.10",
      "global-jsdom": "^8.8.0",
      "http-server": "^14.1.1",
      "ignore-styles": "^5.0.1",
      "jsdom": "^22.1.0",
      "mini-css-extract-plugin": "^2.6.1",
      "mocha": "^10.2.0",
      "node-fetch": "^3.2.10",
      "opener": "^1.5.2",
      "os-browserify": "^0.3.0",
      "prettier": "^2.8.8",
      "rimraf": "^4.4.0",
      "sass": "^1.69.4",
      "sass-loader": "^13.3.2",
      "source-map-loader": "^3.0.2",
      "stream-browserify": "^3.0.0",
      "style-loader": "^3.3.3",
      "ts-loader": "^9.4.2",
      "ts-node": "^10.9.1",
      "typescript": "^4.8.3",
      "url-loader": "^4.1.1",
      "webpack": "^5.76.0",
      "webpack-cli": "^4.10.0"
    },
    "dependencies": {
      "@azure-notebooks/shared-react-components": "0.1.0",
      "@dw/components": "0.0.1-alpha.4",
      "@dw/engines": "0.0.1-alpha.4",
      "@dw/messaging": "0.0.1-alpha.4",
      "@dw/orchestrator": "0.0.1-alpha.4",
      "@dw/visualization-highcharts": "0.0.1-alpha.4",
      "@fluentui/react": "^8.107.6",
      "@jupyterlab/services": "^6.6.6",
      "@nteract/monaco-editor": "^5.0.0",
      "@vscode/codicons": "^0.0.36",
      "@vscode/dts": "^0.4.1",
      "@vscode/extension-telemetry": "^0.9.7",
      "@vscode/l10n": "^0.0.18",
      "@vscode/webview-ui-toolkit": "^1.1.0",
      "fs-extra": "^11.1.1",
      "inversify": "^6.0.2",
      "lodash.clonedeep": "^4.5.0",
      "markdown-it": "^14.1.0",
      "portfinder": "^1.0.32",
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "reflect-metadata": "^0.1.13",
      "semver": "^7.5.3",
      "tcp-port-used": "^1.0.2",
      "tmp": "^0.2.1",
      "uuid": "^9.0.0",
      "vscode-jsonrpc": "^8.1.0",
      "vscode-tas-client": "^0.1.84",
      "ws": "^8.17.1"
    },
    "overrides": {
      "json5": "^2.2.2"
    }
  },
  "extensionKind": 1,
  "isFromDifferentExtensionHost": false
}
```
