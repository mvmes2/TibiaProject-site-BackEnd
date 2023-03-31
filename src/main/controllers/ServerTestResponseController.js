const prismicH = require("@prismicio/helpers");
module.exports = (app) => {
  const { TesteService } = app.src.main.services.ServerTestService;
  const { client } = app.src.main.config.prismicConfig;
  const TesteRequest = async (req, res) => {
    const resp = await TesteService();
    res.status(resp.status).send({ data: resp.data });
  };

  const PrismicListNews = async (req, res) => {
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
        let fullHtml = ``;

        const tituloHeader = prismicH.asHTML(doc.data.titulo_news);

        fullHtml += `<header id="headerNews">${tituloHeader}</header>`;

        doc.data.content.map((content, i, arr) => {
          console.log(content);
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
          <img src="${imageContent}" />`;

          const textContent = prismicH.asHTML(content.text_content);

          fullHtml += `<div class="text-content ${
            i === 0 ? "firstCapitalize" : ""
          }">${textContent}</div>`;

          if (i === arr.length - 1) {
            fullHtml += `</div>`;
          }
        });

        const docFormatted = {
          id: doc.id,
          slug: doc.uid,
          createdAt: doc.first_publication_date,
          updatedAt: doc.last_publication_date,
          nameGM: doc.name_gm,
          content: fullHtml,
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
    PrismicListNews,
  };
};
