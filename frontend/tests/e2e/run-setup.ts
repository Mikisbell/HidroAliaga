
import globalSetup from './setup-users';

(async () => {
    try {
        console.log('Running globalSetup manually...');
        await globalSetup();
        console.log('globalSetup completed successfully');
    } catch (err) {
        console.error('globalSetup failed:', err);
        process.exit(1);
    }
})();
