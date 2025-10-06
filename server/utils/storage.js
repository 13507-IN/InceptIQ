// Shared in-memory storage for analysis results
// In production, this should be replaced with a proper database (MongoDB, PostgreSQL, etc.)

class AnalysisStorage {
    constructor() {
        this.analysisMap = new Map();
    }

    set(id, analysisData) {
        this.analysisMap.set(id, {
            ...analysisData,
            lastAccessed: new Date().toISOString()
        });
    }

    get(id) {
        const analysis = this.analysisMap.get(id);
        if (analysis) {
            analysis.lastAccessed = new Date().toISOString();
        }
        return analysis;
    }

    has(id) {
        return this.analysisMap.has(id);
    }

    delete(id) {
        return this.analysisMap.delete(id);
    }

    keys() {
        return this.analysisMap.keys();
    }

    values() {
        return this.analysisMap.values();
    }

    get size() {
        return this.analysisMap.size;
    }

    // Clean up old analyses (older than 24 hours)
    cleanup(maxAgeHours = 24) {
        const cutoffTime = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000));
        let deletedCount = 0;

        for (const [id, analysis] of this.analysisMap.entries()) {
            const createdAt = new Date(analysis.createdAt);
            if (createdAt < cutoffTime) {
                this.analysisMap.delete(id);
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            console.log(`🧹 Cleaned up ${deletedCount} old analysis records`);
        }

        return deletedCount;
    }

    // Get statistics
    getStats() {
        const analyses = Array.from(this.analysisMap.values());
        const now = new Date();
        
        return {
            total: this.analysisMap.size,
            last24Hours: analyses.filter(a => 
                new Date(a.createdAt) > new Date(now - 24 * 60 * 60 * 1000)
            ).length,
            last7Days: analyses.filter(a => 
                new Date(a.createdAt) > new Date(now - 7 * 24 * 60 * 60 * 1000)
            ).length,
            averageScore: analyses.length > 0 
                ? Math.round(analyses.reduce((sum, a) => sum + (a.analysis?.overallScore || 0), 0) / analyses.length)
                : 0
        };
    }
}

// Create a singleton instance
const analysisStorage = new AnalysisStorage();

// Periodic cleanup (run every hour)
setInterval(() => {
    analysisStorage.cleanup();
}, 60 * 60 * 1000);

module.exports = {
    analysisStorage,
    AnalysisStorage
};
