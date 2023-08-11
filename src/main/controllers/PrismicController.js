const prismicH = require("@prismicio/helpers");
module.exports = (app) => {
  const { TesteService } = app.src.main.services.ServerTestService;
  const { client } = app.src.main.config.prismicConfig;
  const TesteRequest = async (req, res) => {
    const resp = await TesteService();
    res.status(resp.status).send({ data: resp.data });
  };

  const GetUniqueNews = async (req, res) => {
    const { id } = req.params;

    try {
      const news = await client.getByID(id);

      let result;
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

        result = {
          id: news.id,
          slug: news.slugs[0],
          type: news.type,
          createdAt: news.first_publication_date,
          updatedAt: news.last_publication_date,
          nameGM: news.data.name_gm,
          title: tituloHeader,
          content: allContents,
        };

        console.log(result);
      }

      if (news.type === "news-tickers") {
        result = {
          id: news.id,
          slug: news.uid,
          type: news.type,
          createdAt: news.first_publication_date,
          updatedAt: news.last_publication_date,
          content: prismicH.asHTML(news.data["content-tickers"]),
        };
      }

      res.status(200).json({ message: result });
    } catch (err) {
      res.status(400).send({ message: "Server problem, could not found News" });
    }
  };

  const ListAllNews = async (req, res) => {
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

      const result = {
        page: allNews.page,
        totalPage: allNews.total_pages,
        data: formatterNews,
      };

      res.status(200).send({ message: result });
    } catch (err) {
      console.log(err);
      res.status(400).send({ message: "Server problem, could not list News" });
    }
  };

  const ListNewsTickers = async (req, res) => {
    const { limit = 5 } = req.params;

    try {
      const allDocuments = await client.getAllByType("news-tickers", {
        orderings: {
          field: "document.last_publication_date",
          direction: "desc",
        },
        limit,
      });

      const listAllDocuments = allDocuments.reduce((acc, doc) => {
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

      res.status(202).send({ message: listAllDocuments });
    } catch (err) {
      console.log(err);
      res.status(400).send({ message: "Server problem, could not list News" });
    }
  };

  const ListNews = async (req, res) => {
    const { limit = 10 } = req.params;

    try {
      const allDocuments = await client.getAllByType("news-post", {
        orderings: {
          field: "document.last_publication_date",
          direction: "desc",
        },
        limit,
      });

      const newAllDocuments = allDocuments.reduce((acc, doc) => {
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

      res.status(200).send({ message: newAllDocuments });
    } catch (err) {
      res.status(400).send({ message: "Server problem, could not list News" });
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
