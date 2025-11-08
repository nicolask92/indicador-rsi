import NodeCache from 'node-cache';

// Cache de 10 minutos (600 segundos)
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

export default cache;

