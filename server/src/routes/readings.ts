import { Router } from 'express';
import type { ReadingStore } from '../services/readingStore.js';

export function createReadingsRouter(store: ReadingStore): Router {
   const router = Router();

   router.get('/', (_req, res) => {
      res.json(store.getAll());
   });

   router.get('/:nodeId', (req, res) => {
      const reading = store.get(req.params.nodeId);
      if (!reading) {
         res.status(404).json({ error: 'Unknown node id' });
         return;
      }
      res.json(reading);
   });

   return router;
}
