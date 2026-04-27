module.exports = app => {
    const {
        getEconomyDashboardRepository,
        getEconomyMonstersRepository,
        getEconomyMonsterRankingRepository,
        getEconomyMonsterDetailsRepository,
        getEconomyInterventionsRepository,
        getEconomyBreakdownRepository,
        getEconomyTransfersRepository,
    } = app.src.main.repository.EconomyRepository;

    const DAY_IN_MS = 24 * 60 * 60 * 1000;
    const DEFAULT_WINDOW_DAYS = 7;

    const parseTimestamp = (value) => {
        if (value === undefined || value === null || value === '') {
            return null;
        }

        const rawValue = String(value).trim();
        if (!rawValue) {
            return null;
        }

        if (/^\d+$/.test(rawValue)) {
            const parsedNumeric = Number(rawValue);
            if (!Number.isFinite(parsedNumeric)) {
                return null;
            }

            return rawValue.length <= 10 ? parsedNumeric * 1000 : parsedNumeric;
        }

        const parsedDate = new Date(rawValue);
        if (Number.isNaN(parsedDate.getTime())) {
            return null;
        }

        return parsedDate.getTime();
    };

    const resolveDateRange = (query = {}) => {
        const rawTo = parseTimestamp(query.to) || Date.now();
        const rawFrom = parseTimestamp(query.from) || (rawTo - (DEFAULT_WINDOW_DAYS * DAY_IN_MS));

        if (rawFrom >= rawTo) {
            return { error: 'Invalid date range. `from` must be earlier than `to`.' };
        }

        return {
            from: rawFrom,
            to: rawTo,
        };
    };

    const resolveGranularity = (value) => {
        if (value === 'hourly' || value === 'daily') {
            return value;
        }

        return undefined;
    };

    const resolvePositiveInteger = (value, fallback) => {
        const parsed = Number.parseInt(value, 10);
        if (Number.isNaN(parsed) || parsed <= 0) {
            return fallback;
        }

        return parsed;
    };

    const AdminEconomyDashboardRequest = async (req, res) => {
        const range = resolveDateRange(req.query);

        if (range.error) {
            return res.status(400).send({ message: range.error });
        }

        const response = await getEconomyDashboardRepository({
            ...range,
            granularity: resolveGranularity(req.query.granularity),
            limit: resolvePositiveInteger(req.query.limit, 6),
        });

        return res.status(response.status).send({ message: response.message });
    };

    const AdminEconomyMonsterListRequest = async (req, res) => {
        const response = await getEconomyMonstersRepository();
        return res.status(response.status).send({ message: response.message });
    };

    const AdminEconomyMonsterRankingRequest = async (req, res) => {
        const range = resolveDateRange(req.query);

        if (range.error) {
            return res.status(400).send({ message: range.error });
        }

        const response = await getEconomyMonsterRankingRepository({
            ...range,
            limit: resolvePositiveInteger(req.query.limit, 50),
        });

        return res.status(response.status).send({ message: response.message });
    };

    const AdminEconomyMonsterDetailsRequest = async (req, res) => {
        const monsterId = resolvePositiveInteger(req.params.id, 0);

        if (!monsterId) {
            return res.status(400).send({ message: 'Invalid monster id.' });
        }

        const range = resolveDateRange(req.query);

        if (range.error) {
            return res.status(400).send({ message: range.error });
        }

        const response = await getEconomyMonsterDetailsRepository(monsterId, {
            ...range,
            granularity: resolveGranularity(req.query.granularity),
        });

        return res.status(response.status).send({ message: response.message });
    };

    const AdminEconomyInterventionsRequest = async (req, res) => {
        const range = resolveDateRange(req.query);

        if (range.error) {
            return res.status(400).send({ message: range.error });
        }

        const response = await getEconomyInterventionsRepository({
            ...range,
            limit: resolvePositiveInteger(req.query.limit, 12),
        });

        return res.status(response.status).send({ message: response.message });
    };

    const SUPPORTED_BREAKDOWN_COMPARTMENTS = new Set(['bank', 'inventory', 'depot', 'houses']);
    const AdminEconomyBreakdownRequest = async (req, res) => {
        const compartment = String(req.params.compartment || '').toLowerCase();
        if (!SUPPORTED_BREAKDOWN_COMPARTMENTS.has(compartment)) {
            return res.status(400).send({ message: `Invalid compartment '${compartment}'. Use bank | inventory | depot | houses.` });
        }
        const page = resolvePositiveInteger(req.query.page, 1);
        const response = await getEconomyBreakdownRepository(compartment, { page });
        return res.status(response.status).send({ message: response.message });
    };

    const AdminEconomyTransfersRequest = async (req, res) => {
        const range = resolveDateRange(req.query);

        if (range.error) {
            return res.status(400).send({ message: range.error });
        }

        const page = resolvePositiveInteger(req.query.page, 1);
        const response = await getEconomyTransfersRepository({ ...range, page });
        return res.status(response.status).send({ message: response.message });
    };

    return {
        AdminEconomyDashboardRequest,
        AdminEconomyMonsterListRequest,
        AdminEconomyMonsterRankingRequest,
        AdminEconomyMonsterDetailsRequest,
        AdminEconomyInterventionsRequest,
        AdminEconomyBreakdownRequest,
        AdminEconomyTransfersRequest,
    };
};