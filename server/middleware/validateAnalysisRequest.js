const validateAnalysisRequest = (req, res, next) => {
    const { ideaTitle, ideaDescription, targetMarket, businessModel } = req.body;

    // Check required fields
    if (!ideaTitle || !ideaDescription) {
        return res.status(400).json({
            error: 'Missing required fields',
            message: 'Both ideaTitle and ideaDescription are required',
            requiredFields: ['ideaTitle', 'ideaDescription'],
            optionalFields: ['targetMarket', 'businessModel', 'industry', 'budget', 'timeline']
        });
    }

    // Validate field lengths
    if (ideaTitle.length < 3 || ideaTitle.length > 200) {
        return res.status(400).json({
            error: 'Invalid ideaTitle',
            message: 'Title must be between 3 and 200 characters'
        });
    }

    if (ideaDescription.length < 10 || ideaDescription.length > 5000) {
        return res.status(400).json({
            error: 'Invalid ideaDescription',
            message: 'Description must be between 10 and 5000 characters'
        });
    }

    // Sanitize inputs
    req.body.ideaTitle = ideaTitle.trim();
    req.body.ideaDescription = ideaDescription.trim();
    req.body.targetMarket = targetMarket ? targetMarket.trim() : '';
    req.body.businessModel = businessModel ? businessModel.trim() : '';

    next();
};

module.exports = validateAnalysisRequest;
