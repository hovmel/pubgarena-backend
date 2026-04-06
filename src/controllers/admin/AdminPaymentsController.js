import PaymentsServices from '../../services/PaymentsServices';

class AdminPaymentsController {
  static list = async (req, res, next) => {
    try {
      const {
        page, per_page, status, tournament_id, user_id, from_date, to_date,
      } = req.query;
      const result = await PaymentsServices.listAdmin({
        page: Number(page) || 1,
        per_page: Number(per_page) || 50,
        status,
        tournament_id,
        user_id,
        from_date,
        to_date,
      });
      res.json({ status: 'ok', ...result });
    } catch (e) {
      next(e);
    }
  };
}

export default AdminPaymentsController;
