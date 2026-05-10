# Configuração do Google Sheets sem expiração a cada 7 dias

O endpoint `api/export-google-sheets.js` foi refatorado para usar **Google Service Account** em vez de OAuth com `GOOGLE_REFRESH_TOKEN`.

## Por que isso resolve?

O token OAuth pode expirar, especialmente quando o app OAuth está em modo de teste. Com Service Account, a API autentica usando uma chave de servidor e não depende de login manual do usuário.

## Passo a passo

1. Crie uma Service Account no Google Cloud.
2. Ative as APIs:
   - Google Drive API
   - Google Sheets API
3. Gere uma chave JSON da Service Account.
4. Compartilhe com o e-mail da Service Account:
   - a planilha modelo (`GOOGLE_SHEETS_TEMPLATE_ID`)
   - a pasta de saída (`GOOGLE_DRIVE_OUTPUT_FOLDER_ID`)
5. Configure as variáveis de ambiente.

## Variáveis necessárias

```env
GOOGLE_SHEETS_TEMPLATE_ID=ID_DA_PLANILHA_MODELO
GOOGLE_DRIVE_OUTPUT_FOLDER_ID=ID_DA_PASTA_DE_SAIDA
GOOGLE_SERVICE_ACCOUNT_JSON_BASE64=JSON_EM_BASE64
```

Para gerar o base64 localmente:

```bash
base64 -i service-account.json
```

No Windows PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account.json"))
```

## Alternativa sem base64

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=nome@projeto.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Observação importante

A Service Account só acessa arquivos explicitamente compartilhados com o e-mail dela.
