import Image from "next/image";
   
import Cleaning from "../public/Cleaning.jpeg"  
import event from "../public/event.jpeg"
import industry from "../public/industry.jpeg"
import mechanic from "../public/mechanic.jpeg"
import store from "../public/store.jpeg"
import Warehouse from "../public/Warehouse.jpeg"

const services = [
  { id: 1, image: Cleaning, title: "CRM Solutions" },
  { id: 2, image: event, title: "Workflow Automation" },
  { id: 3, image: industry, title: "API Integrations" },
  { id: 4, image: mechanic, title: "Data Analytics" },
  { id: 5, image: store, title: "AI-Powered Tools" },
  { id: 6, image: Warehouse, title: "AI-Powered Tools" },
];

const ServicesCarousel = () => {
  return (
    <div className="w-full overflow-hidden bg-gradient-to-br from-[#0f2d1e] via-[#143d2b] to-[#1f4733]   py-10 px-4">
      <div className="inline-flex gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="inline-block w-64 h-40 bg-white rounded-2xl shadow-lg overflow-hidden transform transition hover:scale-105"
          >
            <Image
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesCarousel;
