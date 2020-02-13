# spiiras-crossref

Для установки, выполните в консоли следующие команды:

- **git clone https://github.com/Hennos/spiiras-crossref.git**
- **cd spiiras-crossref/server**
- **npm install**
- **npm start**

Сервер по умолчанию будет доступен адресу http://localhost:3000.

Через **default.json** в папке **server/config** можно настроить работу приложения. Для этого доступны следующие опции:

- **port** - номер порта, который будет прослушиваться сервером
- **rows** - количество найденных результатов в поисковой выдаче

Опции, необходимые для работы с CrossrefAPI

- **agentName** - имя приложения, использующего CrossrefAPI
- **agentVersion** - версия приложения, использующего CrossrefAPI
- **mailTo** - почта для связи

Поиск осуществляется посредством **CrossrefAPI**. Доступны запросы:

- **GET http://{доменное_имя}:{номер_порта}/article-metadata/{doi}** - поиск метаданных статьи по её DOI
- **GET http://{доменное_имя}:{номер_порта}/search-articles?{параметры_запроса}** - поиск метаданных статей через поисковый запроc. Параметры могут быть скомбинированы через &.

Поддерживается следующие параметры поиска:
  
| Наименование параметра | Описание |
|-----------------------|-------------|
| `query.container-title` | Query `container-title` aka. publication name |
| `query.author` | Query author given and family names |
| `query.editor` | Query editor given and family names |
| `query.chair` | Query chair given and family names |
| `query.translator` | Query translator given and family names |
| `query.contributor` | Query author, editor, chair and translator given and family names |
| `query.bibliographic` | Query bibliographic information, useful for citation look up. Includes titles, authors, ISSNs and publication years |
| `query.affiliation` | Query contributor affiliations |
