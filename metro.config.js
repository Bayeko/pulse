import { getDefaultConfig } from '@expo/metro-config';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  ...(config.resolver.alias || {}),
  '@': path.resolve(__dirname, 'src'),
};

export default config;
