import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Example client data
const clients = [
  {
    name: "Alice Johnson",
    title: "CEO, TechCorp",
    testimonial: "This team transformed our project and exceeded expectations!",
    avatar: "/avatars/alice.jpg", // replace with real image path
  },
  {
    name: "Mark Williams",
    title: "Founder, StartUpX",
    testimonial: "Professional, efficient, and creative. Highly recommend!",
    avatar: "/avatars/mark.jpg",
  },
  {
    name: "Sara Khan",
    title: "CTO, Innovatech",
    testimonial: "Outstanding service and excellent communication throughout.",
    avatar: "/avatars/sara.jpg",
  },
  {
    name: "David Lee",
    title: "Product Manager, SoftSolutions",
    testimonial: "They delivered on time and the quality was top-notch.",
    avatar: "/avatars/david.jpg",
  },
  {
    name: "Nadia Ahmed",
    title: "Marketing Head, Brandify",
    testimonial: "Absolutely delighted with the results and collaboration!",
    avatar: "/avatars/nadia.jpg",
  },
];

export default function CarouselSizes() {
  return (
    <div className="w-full p-6 flex justify-center">
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full max-w-6xl"
      >
        <CarouselContent>
          {clients.map((client, index) => (
            <CarouselItem key={index} className=" md:basis-1/2 lg:basis-1/3 p-2">
              <Card className="bg-gray-950 text-white h-full shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className=" flex flex-col items-center justify-center p-6 text-center">
                  {/* Avatar */}
                  {client.avatar && (
                    <img
                      src={client.avatar}
                      alt={client.name}
                      className="w-20 h-20 rounded-full mb-4 object-cover border border-white/10"
                    />
                  )}

                  {/* Name & Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{client.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{client.title}</p>

                  {/* Testimonial */}
                  <p className="text-gray-700 text-base">{client.testimonial}</p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
