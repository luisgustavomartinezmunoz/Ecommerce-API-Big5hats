import { Router } from "express";
import { agregarWishlist, eliminarWishlist, listarWishlist } from "../controllers/wishlist.controller.js";
import verificarToken from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", verificarToken, listarWishlist);
router.post("/", verificarToken, agregarWishlist);
router.delete("/:id", verificarToken, eliminarWishlist);

export default router;
