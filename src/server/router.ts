import { Router } from "express";

const router = Router();

router.get('/:name', (request, response) => {
  response.json({
    name: request.params.name,
  });
});

export { router };