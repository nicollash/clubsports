import { generatePdf } from '../app/pdf/generatePdf.js';

export default api => {
  api.post('/generate-pdf', async (req, res) => {
    try {
      const result = await generatePdf(req.body);
      /*res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Requested-With',
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Waiver-${new Date().getTime()}.pdf`,
      });
      result.pipe(res);*/
      res.json(result);
      //res.send(result);
    } catch (err) {
      res.json({
        success: false,
        message: err.message,
        stack: err.stack,
      });
    }
  });

  return api;
};
