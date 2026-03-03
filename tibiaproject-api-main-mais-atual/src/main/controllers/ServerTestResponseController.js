const prismicH = require("@prismicio/helpers");
module.exports = (app) => {

  const moment = require('moment');

  const { TesteService } = app.src.main.services.ServerTestService;
  const { client } = app.src.main.config.prismicConfig;

  const TesteRequest = async (req, res) => {
    const resp = await TesteService();
    res.status(resp.status).send({ data: resp.data });
  };

  let listAllDocumentsNewsTickersLastUpdate = 0;
  let listAllDocumentsNewsTickers = 0;

  const ListNewsTickers = async (req, res) => {
    const { limit = 5 } = req.params;

    try {
      if (moment().diff(listAllDocumentsNewsTickersLastUpdate, 'minutes') < 5) {
        console.log('cache news-tickers feito com sucesso!');
        return res.status(202).send({ message: listAllDocumentsNewsTickers });
      }
      const allDocuments = await client.getAllByType("news-tickers", {
        orderings: {
          field: "document.last_publication_date",
          direction: "desc",
        },
        limit
      })

      listAllDocumentsNewsTickersLastUpdate = moment();
      listAllDocumentsNewsTickers = allDocuments.reduce((acc, doc) => {

        const arr = acc

        const formattedDoc = {
          id: doc.id,
          slug: doc.uid,
          createdAt: doc.first_publication_date,
          updatedAt: doc.last_publication_date,
          content: prismicH.asHTML(doc.data['content-tickers']),
        }
        arr.push(formattedDoc)

        return arr
      }, [])

     return res.status(202).send({ message: listAllDocumentsNewsTickers });
    } catch (err) {
      console.log(err)
      res.status(400).send({ message: "Server problem, could not list News" });

    }
  }

  let ListNewsLastUpdate = 0;
  let newsAllDocuments = 0;

  const ListNews = async (req, res) => {
    const { limit = 10 } = req.params;

    try {
      if (moment().diff(ListNewsLastUpdate, 'minutes') < 5) {
        console.log('cache News feito com sucesso!');
        return res.status(200).send({ message: newsAllDocuments });
      }

      const allDocuments = await client.getAllByType("news-post", {
        orderings: {
          field: "document.last_publication_date",
          direction: "desc",
        },
        limit,
      });

      ListNewsLastUpdate = moment();
      newsAllDocuments = allDocuments.reduce((acc, doc) => {
        
        const tituloHeader = prismicH.asHTML(doc.data.titulo_news);
        const allContents = []
        
        doc.data.content.map((content, i, arr) => {
          let fullHtml = ``;

          const imageContent = prismicH.asImageSrc(
            content.image_content
          );
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

          allContents.push(fullHtml)
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

     return res.status(200).send({ message: newsAllDocuments });
    } catch (err) {
     return res.status(400).send({ message: "Server problem, could not list News" });
    }
  };
  return {
    TesteRequest,
    ListNews,
    ListNewsTickers
  };
};
