import { Loader2 } from "lucide-react";

function Loader() {
  return (
    <div className="flex flex-col justify-center  items-center">
      <Loader2 className="w-16 h-16 animate-spin text-blue-500 mb-4" />
      <h1 className="text-xl  text-gray-900 mb-2">Loading..</h1>
    </div>
  );
}

export default Loader;
