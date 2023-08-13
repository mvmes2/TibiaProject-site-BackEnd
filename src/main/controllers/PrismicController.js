const prismicH = require("@prismicio/helpers");
module.exports = (app) => {
  const moment = require('moment');
  const { TesteService } = app.src.main.services.ServerTestService;
  const { client } = app.src.main.config.prismicConfig;

  const TesteRequest = async (req, res) => {
    const resp = await TesteService();
    res.status(resp.status).send({ data: resp.data });
  };

  let getUniqueItensLastUpdated = 0;
  let uniqueItemInfo = 0;
  let uniqueItemID = 0;

  const GetUniqueNews = async (req, res) => {
    const { id } = req.params;
    console.log('que id é esse?................................... ', id, uniqueItemID);
    console.log('VAI ENTRAR NO CACHE??????')
    if (uniqueItemID.toString() == id.toString() && moment().diff(getUniqueItensLastUpdated, 'minutes') < 5) {
      console.log('ENTROU NO CACHE!!!')
      console.log('CACHE GetUniqueNews feito com sucesso.................!');
      return res.status(200).json({ message: uniqueItemInfo });
    }
    try {
      console.log('NÃO ENTROU NO CACHE!!!!!!!')
      uniqueItemID = id;
      const news = await client.getByID(id);

      if (news.type === "news-post") {
        const tituloHeader = prismicH.asHTML(news.data.titulo_news);
        const allContents = [];
        news.data.content.map((content, i, arr) => {
          let fullHtml = ``;

          const imageContent = prismicH.asImageSrc(content.image_content);
          if (i === 0) {
            fullHtml += `
            <div id="content" className="${
              !imageContent
                ? "col"
                : content.position_image
                ? `${content.position_image}`
                : null
            }">
            `;
          }

          if (imageContent)
            fullHtml += `
          <img src="${imageContent}" className="image-side" />`;

          const textContent = prismicH.asHTML(content.text_content);

          fullHtml += `<div class="text-content ${
            i === 0 ? "firstCapitalize" : ""
          }">${textContent}</div>`;

          if (i === arr.length - 1) {
            fullHtml += `</div>`;
          }

          allContents.push(fullHtml);
        });

        uniqueItemInfo = {
          id: news.id,
          slug: news.slugs[0],
          type: news.type,
          createdAt: news.first_publication_date,
          updatedAt: news.last_publication_date,
          nameGM: news.data.name_gm,
          title: tituloHeader,
          content: allContents,
        };
      }

      if (news.type === "news-tickers") {
        uniqueItemInfo = {
          id: news.id,
          slug: news.uid,
          type: news.type,
          createdAt: news.first_publication_date,
          updatedAt: news.last_publication_date,
          content: prismicH.asHTML(news.data["content-tickers"]),
        };
      }

      getUniqueItensLastUpdated = moment();
      return res.status(200).json({ message: uniqueItemInfo });
    } catch (err) {
      res.status(400).send({ message: "Server problem, could not found News" });
    }
  };

  let listAllNewsLastUpdated = 0;
  let listAllNewsInfo = 0;

  const ListAllNews = async (req, res) => {

    if (moment().diff(listAllNewsLastUpdated, 'minutes') < 5) {
      console.log('CACHE ListAllNews feito com sucesso!');
      return res.status(200).send({ message: listAllNewsInfo });
    };

    try {
      const { page } = req.params;
      const allNews = await client.get({
        orderings: {
          field: "document.last_publication_date",
          direction: "desc",
        },
        page,
        pageSize: 10,
      });

      const formatterNews = allNews.results.reduce((acc, news) => {
        if (news.type === "news-post") {
          // prismicH.asHTML(news.data.content[0].text_content)
          const newsPost = {
            id: news.id,
            type: news.type,
            slug: news.slugs[0],
            titleNews: prismicH.asHTML(news.data.titulo_news),
            nameGM: news.data.name_gm,
            createdAt: news.first_publication_date,
            updatedAt: news.last_publication_date,
            content: prismicH.asHTML(news.data.content[0].text_content),
          };
          acc.push(newsPost);
          return acc;
        }

        if (news.type === "news-tickers") {
          const newsTicker = {
            id: news.id,
            type: news.type,
            slug: news.slugs[0],
            content: prismicH.asHTML(news.data["content-tickers"]),
            createdAt: news.first_publication_date,
            updatedAt: news.last_publication_date,
          };
          acc.push(newsTicker);
          return acc;
        }
      }, []);

      listAllNewsInfo = {
        page: allNews.page,
        totalPage: allNews.total_pages,
        data: formatterNews,
      };
      listAllNewsLastUpdated = moment();
      return res.status(200).send({ message: listAllNewsInfo });
    } catch (err) {
      console.log(err);
      return res.status(400).send({ message: "Server problem, could not list News" });
    }
  };

  let listNewsTickerLastUpdated = 0;
  let listNewsTickersInfo = 0;

  const ListNewsTickers = async (req, res) => {
    const { limit = 5 } = req.params;

    if (moment().diff(listNewsTickerLastUpdated, 'minutes') < 5) {
      console.log('CACHE ListNewsTickers feito com sucesso!');
      return res.status(202).send({ message: listNewsTickersInfo });
    }

    try {
      const allDocuments = await client.getAllByType("news-tickers", {
        orderings: {
          field: "document.last_publication_date",
          direction: "desc",
        },
        limit,
      });

      listNewsTickersInfo = allDocuments.reduce((acc, doc) => {
        const arr = acc;

        const formattedDoc = {
          id: doc.id,
          slug: doc.uid,
          createdAt: doc.first_publication_date,
          updatedAt: doc.last_publication_date,
          content: prismicH.asHTML(doc.data["content-tickers"]),
        };
        arr.push(formattedDoc);

        return arr;
      }, []);
      listNewsTickerLastUpdated = moment();
     return res.status(202).send({ message: listNewsTickersInfo });
    } catch (err) {
      console.log(err);
      return res.status(400).send({ message: "Server problem, could not list News" });
    }
  };

  let listNewsLastUpdated = 0;
  let listNewsInfo = 0;

  const ListNews = async (req, res) => {
    const { limit = 10 } = req.params;
    if (moment().diff(listNewsLastUpdated, 'minutes') < 5) {
      console.log('CACHE listNews Feito com sucesso!');
      return res.status(200).send({ message: listNewsInfo });
    };

    try {
      const allDocuments = await client.getAllByType("news-post", {
        orderings: {
          field: "document.last_publication_date",
          direction: "desc",
        },
        limit,
      });

      listNewsInfo = allDocuments.reduce((acc, doc) => {
        const tituloHeader = prismicH.asHTML(doc.data.titulo_news);
        const allContents = [];

        doc.data.content.map((content, i, arr) => {
          let fullHtml = ``;

          const imageContent = prismicH.asImageSrc(content.image_content);
          if (i === 0) {
            fullHtml += `
            <div id="content" className="${
              !imageContent
                ? "col"
                : content.position_image
                ? `${content.position_image}`
                : null
            }">
            `;
          }

          if (imageContent)
            fullHtml += `
          <img src="${imageContent}" className="image-side" />`;

          const textContent = prismicH.asHTML(content.text_content);

          fullHtml += `<div class="text-content ${
            i === 0 ? "firstCapitalize" : ""
          }">${textContent}</div>`;

          if (i === arr.length - 1) {
            fullHtml += `</div>`;
          }

          allContents.push(fullHtml);
        });

        const docFormatted = {
          id: doc.id,
          slug: doc.uid,
          createdAt: doc.first_publication_date,
          updatedAt: doc.last_publication_date,
          nameGM: doc.name_gm,
          titulo: tituloHeader,
          content: allContents,
        };

        return [...acc, docFormatted];
      }, []);

      listNewsLastUpdated = moment();
      return res.status(200).send({ message: listNewsInfo });
    } catch (err) {
     return res.status(400).send({ message: "Server problem, could not list News" });
    }
  };
  return {
    TesteRequest,
    GetUniqueNews,
    ListNews,
    ListNewsTickers,
    ListAllNews,
  };
};
