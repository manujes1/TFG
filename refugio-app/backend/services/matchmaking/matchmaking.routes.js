import { Router } from 'express';
import { z } from 'zod';
import { evaluarAnimales } from './matchmaking.service.js';

const router = Router();

const evaluarSchema = z.object({
  perfil: z.record(z.string(), z.any()),
  animales: z.array(z.object({ id: z.string() }).passthrough())
});

/**
 * Evalúa la compatibilidad de un perfil con una lista de animales.
 * Lo llaman los servicios de ia y recomendaciones. No consulta la base de
 * datos: trabaja solo con los datos que recibe.
 *
 * Responde con un resultado por animal, en el mismo orden.
 */
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
