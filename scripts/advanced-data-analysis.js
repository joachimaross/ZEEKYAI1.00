// Advanced Data Analysis and Visualization System
// Comprehensive data processing, statistical analysis, and visualization capabilities

class AdvancedDataAnalysis {
    constructor() {
        this.datasets = new Map();
        this.analyses = new Map();
        this.visualizations = new Map();
        this.models = new Map();
        this.processors = {
            csv: new CSVProcessor(),
            json: new JSONProcessor(),
            excel: new ExcelProcessor(),
            sql: new SQLProcessor(),
            image: new ImageDataProcessor(),
            text: new TextDataProcessor()
        };
        this.init();
    }

    init() {
        this.setupStatisticalMethods();
        this.setupMachineLearning();
        this.setupVisualizationEngine();
        this.createDataAnalysisUI();
        console.log('📊 Advanced Data Analysis System initialized');
    }

    // Data Import and Processing
    async importData(file, options = {}) {
        try {
            const fileType = this.detectFileType(file);
            const processor = this.processors[fileType];
            
            if (!processor) {
                throw new Error(`Unsupported file type: ${fileType}`);
            }

            const dataset = await processor.process(file, options);
            const datasetId = this.generateDatasetId();
            
            // Store dataset
            this.datasets.set(datasetId, {
                id: datasetId,
                name: file.name || 'Unnamed Dataset',
                type: fileType,
                data: dataset.data,
                metadata: dataset.metadata,
                schema: dataset.schema,
                importedAt: new Date().toISOString(),
                size: dataset.data.length
            });

            // Perform initial analysis
            const initialAnalysis = await this.performInitialAnalysis(datasetId);
            
            return {
                success: true,
                datasetId,
                dataset: this.datasets.get(datasetId),
                analysis: initialAnalysis
            };

        } catch (error) {
            console.error('Data import failed:', error);
            return { success: false, error: error.message };
        }
    }

    async performInitialAnalysis(datasetId) {
        const dataset = this.datasets.get(datasetId);
        if (!dataset) throw new Error('Dataset not found');

        const analysis = {
            basic: await this.getBasicStatistics(dataset.data),
            distribution: await this.analyzeDistribution(dataset.data),
            correlations: await this.calculateCorrelations(dataset.data),
            outliers: await this.detectOutliers(dataset.data),
            missing: await this.analyzeMissingData(dataset.data),
            quality: await this.assessDataQuality(dataset.data)
        };

        this.analyses.set(datasetId, analysis);
        return analysis;
    }

    // Statistical Analysis Methods
    setupStatisticalMethods() {
        this.statistics = {
            descriptive: {
                mean: (data) => data.reduce((a, b) => a + b, 0) / data.length,
                median: (data) => {
                    const sorted = [...data].sort((a, b) => a - b);
                    const mid = Math.floor(sorted.length / 2);
                    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
                },
                mode: (data) => {
                    const freq = {};
                    data.forEach(val => freq[val] = (freq[val] || 0) + 1);
                    return Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b);
                },
                standardDeviation: (data) => {
                    const mean = this.statistics.descriptive.mean(data);
                    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length;
                    return Math.sqrt(variance);
                },
                variance: (data) => {
                    const mean = this.statistics.descriptive.mean(data);
                    return data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length;
                },
                skewness: (data) => {
                    const mean = this.statistics.descriptive.mean(data);
                    const std = this.statistics.descriptive.standardDeviation(data);
                    const n = data.length;
                    return data.reduce((acc, val) => acc + Math.pow((val - mean) / std, 3), 0) / n;
                },
                kurtosis: (data) => {
                    const mean = this.statistics.descriptive.mean(data);
                    const std = this.statistics.descriptive.standardDeviation(data);
                    const n = data.length;
                    return data.reduce((acc, val) => acc + Math.pow((val - mean) / std, 4), 0) / n - 3;
                }
            },
            inferential: {
                tTest: (sample1, sample2) => this.performTTest(sample1, sample2),
                chiSquare: (observed, expected) => this.performChiSquareTest(observed, expected),
                anova: (groups) => this.performANOVA(groups),
                regression: (x, y) => this.performLinearRegression(x, y),
                correlation: (x, y) => this.calculatePearsonCorrelation(x, y)
            }
        };
    }

    async getBasicStatistics(data) {
        const numericColumns = this.getNumericColumns(data);
        const stats = {};

        numericColumns.forEach(column => {
            const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
            
            stats[column] = {
                count: values.length,
                mean: this.statistics.descriptive.mean(values),
                median: this.statistics.descriptive.median(values),
                mode: this.statistics.descriptive.mode(values),
                std: this.statistics.descriptive.standardDeviation(values),
                variance: this.statistics.descriptive.variance(values),
                min: Math.min(...values),
                max: Math.max(...values),
                range: Math.max(...values) - Math.min(...values),
                skewness: this.statistics.descriptive.skewness(values),
                kurtosis: this.statistics.descriptive.kurtosis(values),
                percentiles: this.calculatePercentiles(values)
            };
        });

        return stats;
    }

    // Machine Learning Setup
    setupMachineLearning() {
        this.ml = {
            clustering: {
                kmeans: (data, k) => this.performKMeans(data, k),
                hierarchical: (data) => this.performHierarchicalClustering(data),
                dbscan: (data, eps, minPts) => this.performDBSCAN(data, eps, minPts)
            },
            classification: {
                decisionTree: (features, labels) => this.trainDecisionTree(features, labels),
                randomForest: (features, labels) => this.trainRandomForest(features, labels),
                svm: (features, labels) => this.trainSVM(features, labels),
                naiveBayes: (features, labels) => this.trainNaiveBayes(features, labels)
            },
            regression: {
                linear: (x, y) => this.performLinearRegression(x, y),
                polynomial: (x, y, degree) => this.performPolynomialRegression(x, y, degree),
                logistic: (x, y) => this.performLogisticRegression(x, y)
            },
            dimensionality: {
                pca: (data, components) => this.performPCA(data, components),
                tsne: (data, dimensions) => this.performTSNE(data, dimensions),
                umap: (data, dimensions) => this.performUMAP(data, dimensions)
            }
        };
    }

    // Visualization Engine
    setupVisualizationEngine() {
        this.visualizations = {
            charts: {
                line: (data, options) => this.createLineChart(data, options),
                bar: (data, options) => this.createBarChart(data, options),
                scatter: (data, options) => this.createScatterPlot(data, options),
                histogram: (data, options) => this.createHistogram(data, options),
                boxplot: (data, options) => this.createBoxPlot(data, options),
                heatmap: (data, options) => this.createHeatmap(data, options),
                pie: (data, options) => this.createPieChart(data, options),
                violin: (data, options) => this.createViolinPlot(data, options)
            },
            advanced: {
                parallel: (data, options) => this.createParallelCoordinates(data, options),
                sankey: (data, options) => this.createSankeyDiagram(data, options),
                treemap: (data, options) => this.createTreemap(data, options),
                network: (data, options) => this.createNetworkGraph(data, options),
                geographic: (data, options) => this.createGeographicMap(data, options)
            },
            interactive: {
                dashboard: (widgets) => this.createInteractiveDashboard(widgets),
                filter: (data, filters) => this.createFilterableView(data, filters),
                drill: (data, hierarchy) => this.createDrillDownView(data, hierarchy)
            }
        };
    }

    // Advanced Analysis Methods
    async performAdvancedAnalysis(datasetId, analysisType, options = {}) {
        const dataset = this.datasets.get(datasetId);
        if (!dataset) throw new Error('Dataset not found');

        let result;

        switch (analysisType) {
            case 'clustering':
                result = await this.performClusteringAnalysis(dataset.data, options);
                break;
            case 'classification':
                result = await this.performClassificationAnalysis(dataset.data, options);
                break;
            case 'regression':
                result = await this.performRegressionAnalysis(dataset.data, options);
                break;
            case 'time_series':
                result = await this.performTimeSeriesAnalysis(dataset.data, options);
                break;
            case 'anomaly_detection':
                result = await this.performAnomalyDetection(dataset.data, options);
                break;
            case 'feature_importance':
                result = await this.analyzeFeatureImportance(dataset.data, options);
                break;
            case 'predictive_modeling':
                result = await this.buildPredictiveModel(dataset.data, options);
                break;
            default:
                throw new Error(`Unknown analysis type: ${analysisType}`);
        }

        // Store analysis result
        const analysisId = this.generateAnalysisId();
        this.analyses.set(analysisId, {
            id: analysisId,
            datasetId,
            type: analysisType,
            options,
            result,
            createdAt: new Date().toISOString()
        });

        return { analysisId, result };
    }

    // Visualization Creation
    async createVisualization(datasetId, chartType, options = {}) {
        const dataset = this.datasets.get(datasetId);
        if (!dataset) throw new Error('Dataset not found');

        const chartFunction = this.visualizations.charts[chartType] || 
                             this.visualizations.advanced[chartType] ||
                             this.visualizations.interactive[chartType];

        if (!chartFunction) {
            throw new Error(`Unknown chart type: ${chartType}`);
        }

        const visualization = await chartFunction(dataset.data, options);
        const vizId = this.generateVisualizationId();

        this.visualizations.set(vizId, {
            id: vizId,
            datasetId,
            type: chartType,
            options,
            chart: visualization,
            createdAt: new Date().toISOString()
        });

        return { vizId, visualization };
    }

    // Data Analysis UI
    createDataAnalysisUI() {
        const analysisPanel = document.createElement('div');
        analysisPanel.id = 'data-analysis-panel';
        analysisPanel.className = 'data-analysis-panel';
        analysisPanel.innerHTML = `
            <div class="analysis-header">
                <h3>📊 Data Analysis</h3>
                <div class="analysis-actions">
                    <button class="import-data-btn" onclick="window.dataAnalysis.showImportDialog()">
                        <i class="fas fa-upload"></i> Import Data
                    </button>
                    <button class="create-viz-btn" onclick="window.dataAnalysis.showVisualizationDialog()">
                        <i class="fas fa-chart-bar"></i> Create Chart
                    </button>
                </div>
            </div>
            <div class="datasets-section">
                <h4>Datasets</h4>
                <div class="datasets-list" id="datasets-list">
                    ${this.renderDatasetsList()}
                </div>
            </div>
            <div class="analysis-workspace" id="analysis-workspace">
                <div class="workspace-placeholder">
                    Import data to begin analysis
                </div>
            </div>
        `;

        // Add to main content area
        const mainContent = document.querySelector('.dashboard-main, .main-content');
        if (mainContent) {
            mainContent.appendChild(analysisPanel);
        }
    }

    renderDatasetsList() {
        if (this.datasets.size === 0) {
            return '<div class="no-datasets">No datasets imported</div>';
        }

        let html = '';
        this.datasets.forEach((dataset, id) => {
            html += `
                <div class="dataset-item" data-dataset="${id}">
                    <div class="dataset-info">
                        <div class="dataset-name">${dataset.name}</div>
                        <div class="dataset-meta">${dataset.size} rows • ${dataset.type.toUpperCase()}</div>
                    </div>
                    <div class="dataset-actions">
                        <button onclick="window.dataAnalysis.analyzeDataset('${id}')">
                            <i class="fas fa-analytics"></i>
                        </button>
                        <button onclick="window.dataAnalysis.visualizeDataset('${id}')">
                            <i class="fas fa-chart-line"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        return html;
    }

    // Utility Methods
    detectFileType(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        const typeMap = {
            'csv': 'csv',
            'json': 'json',
            'xlsx': 'excel',
            'xls': 'excel',
            'sql': 'sql',
            'txt': 'text',
            'png': 'image',
            'jpg': 'image',
            'jpeg': 'image'
        };
        return typeMap[extension] || 'unknown';
    }

    getNumericColumns(data) {
        if (!data || data.length === 0) return [];
        
        const firstRow = data[0];
        return Object.keys(firstRow).filter(key => {
            const value = firstRow[key];
            return !isNaN(parseFloat(value)) && isFinite(value);
        });
    }

    calculatePercentiles(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const percentiles = {};
        
        [5, 10, 25, 50, 75, 90, 95].forEach(p => {
            const index = (p / 100) * (sorted.length - 1);
            const lower = Math.floor(index);
            const upper = Math.ceil(index);
            const weight = index - lower;
            
            percentiles[`p${p}`] = sorted[lower] * (1 - weight) + sorted[upper] * weight;
        });
        
        return percentiles;
    }

    generateDatasetId() {
        return 'dataset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateAnalysisId() {
        return 'analysis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateVisualizationId() {
        return 'viz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Public API
    getDatasets() {
        return Array.from(this.datasets.values());
    }

    getAnalyses() {
        return Array.from(this.analyses.values());
    }

    getVisualizations() {
        return Array.from(this.visualizations.values());
    }

    async exportAnalysis(analysisId, format = 'json') {
        const analysis = this.analyses.get(analysisId);
        if (!analysis) throw new Error('Analysis not found');

        const exportData = {
            analysis,
            dataset: this.datasets.get(analysis.datasetId),
            exportedAt: new Date().toISOString()
        };

        switch (format) {
            case 'json':
                return JSON.stringify(exportData, null, 2);
            case 'csv':
                return this.convertToCSV(exportData);
            case 'pdf':
                return await this.generatePDFReport(exportData);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
}

// Supporting Data Processor Classes
class CSVProcessor {
    async process(file, options = {}) {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        const delimiter = options.delimiter || this.detectDelimiter(text);
        
        const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map(line => {
            const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''));
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            return row;
        });

        return {
            data,
            metadata: { delimiter, headers, rowCount: data.length },
            schema: this.inferSchema(data, headers)
        };
    }

    detectDelimiter(text) {
        const delimiters = [',', ';', '\t', '|'];
        const firstLine = text.split('\n')[0];
        
        return delimiters.reduce((best, delimiter) => {
            const count = (firstLine.match(new RegExp(delimiter, 'g')) || []).length;
            return count > best.count ? { delimiter, count } : best;
        }, { delimiter: ',', count: 0 }).delimiter;
    }

    inferSchema(data, headers) {
        const schema = {};
        
        headers.forEach(header => {
            const values = data.map(row => row[header]).filter(v => v !== '');
            const types = values.map(v => this.inferType(v));
            const mostCommonType = this.getMostCommonType(types);
            
            schema[header] = {
                type: mostCommonType,
                nullable: values.length < data.length,
                unique: new Set(values).size === values.length
            };
        });
        
        return schema;
    }

    inferType(value) {
        if (!isNaN(parseFloat(value)) && isFinite(value)) {
            return value.includes('.') ? 'float' : 'integer';
        }
        if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
            return 'boolean';
        }
        if (Date.parse(value)) {
            return 'date';
        }
        return 'string';
    }

    getMostCommonType(types) {
        const counts = {};
        types.forEach(type => counts[type] = (counts[type] || 0) + 1);
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }
}

class JSONProcessor {
    async process(file, options = {}) {
        const text = await file.text();
        const jsonData = JSON.parse(text);
        
        // Handle different JSON structures
        let data;
        if (Array.isArray(jsonData)) {
            data = jsonData;
        } else if (jsonData.data && Array.isArray(jsonData.data)) {
            data = jsonData.data;
        } else {
            data = [jsonData];
        }

        const headers = Object.keys(data[0] || {});
        
        return {
            data,
            metadata: { format: 'json', headers, rowCount: data.length },
            schema: this.inferSchema(data, headers)
        };
    }

    inferSchema(data, headers) {
        // Similar to CSV processor
        const schema = {};
        
        headers.forEach(header => {
            const values = data.map(row => row[header]).filter(v => v != null);
            const types = values.map(v => typeof v);
            const mostCommonType = this.getMostCommonType(types);
            
            schema[header] = {
                type: mostCommonType,
                nullable: values.length < data.length,
                unique: new Set(values).size === values.length
            };
        });
        
        return schema;
    }

    getMostCommonType(types) {
        const counts = {};
        types.forEach(type => counts[type] = (counts[type] || 0) + 1);
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }
}

class ExcelProcessor {
    async process(file, options = {}) {
        // Mock Excel processing (in production, use a library like SheetJS)
        return {
            data: [{ message: 'Excel processing requires additional library' }],
            metadata: { format: 'excel', sheets: 1 },
            schema: { message: { type: 'string', nullable: false, unique: true } }
        };
    }
}

class SQLProcessor {
    async process(file, options = {}) {
        // Mock SQL processing
        return {
            data: [{ message: 'SQL processing requires database connection' }],
            metadata: { format: 'sql', queries: 1 },
            schema: { message: { type: 'string', nullable: false, unique: true } }
        };
    }
}

class ImageDataProcessor {
    async process(file, options = {}) {
        // Mock image data extraction
        return {
            data: [{ 
                filename: file.name,
                size: file.size,
                type: file.type,
                width: 1024,
                height: 768,
                format: 'RGB'
            }],
            metadata: { format: 'image', channels: 3 },
            schema: {
                filename: { type: 'string', nullable: false, unique: true },
                size: { type: 'integer', nullable: false, unique: false },
                width: { type: 'integer', nullable: false, unique: false },
                height: { type: 'integer', nullable: false, unique: false }
            }
        };
    }
}

class TextDataProcessor {
    async process(file, options = {}) {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        const data = lines.map((line, index) => ({
            line_number: index + 1,
            text: line,
            length: line.length,
            word_count: line.split(/\s+/).length
        }));

        return {
            data,
            metadata: { format: 'text', lines: lines.length, total_chars: text.length },
            schema: {
                line_number: { type: 'integer', nullable: false, unique: true },
                text: { type: 'string', nullable: false, unique: false },
                length: { type: 'integer', nullable: false, unique: false },
                word_count: { type: 'integer', nullable: false, unique: false }
            }
        };
    }
}

// Initialize Advanced Data Analysis
document.addEventListener('DOMContentLoaded', () => {
    window.dataAnalysis = new AdvancedDataAnalysis();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedDataAnalysis;
}
