import { Router } from 'express';
import { z } from 'zod';
import { evaluarAnimales } from './matchmaking.service.js';

const router = Router();

const evaluarSchema = z.object({
  perfil: z.record(z.string(), z.any()),
  animales: z.array(z.object({ id: z.string() }).passthrough())
});

router.post('/evaluar', async (req, res, next) => {
  try {
    const { perfil, animales } = evaluarSchema.parse(req.body);
    const resultados = await evaluarAnimales(perfil, animales);
    res.json(resultados.map(({ animal: _, ...resultado }) => resultado));
  } catch (err) {
    next(err);
  }
});

export default router;
