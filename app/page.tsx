import { redirect } from "next/navigation";
import { PATHS } from "@/app/constants";

/**
 * El sistema es interno: no hay pagina publica. La raiz manda
 * al ingreso y el resto lo resuelve la sesion.
 */
const Home = () => {
  redirect(PATHS.ACCESS.LOGIN);
};

export default Home;
