import { Card, CardContent } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { useOutletContext } from "react-router";
import type { AuthOutletContext } from "./_user";
import * as BABYLON from "babylonjs";
import { useEffect, useRef, useState } from "react";
import { useFindMany, useFindOne } from "@gadgetinc/react";
import { api } from "../api";
import { Timeline } from "@/components/ui/timeline";
import { UserPhaseEnum } from "@gadget-client/quickpulse";

// Define a type for UserPriorityEnum
type UserPriorityEnum = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | null;

// Helper function to get color based on priority
const getPriorityColor = (priority: UserPriorityEnum): string => {
  switch (priority) {
    case "LOW":
      return "bg-green-500";
    case "MEDIUM":
      return "bg-yellow-500";
    case "HIGH":
      return "bg-orange-500";
    case "CRITICAL":
      return "bg-red-500";
    default:
      return "bg-gray-300"; // Default color for null or unknown priority
  }
};

// Helper function to generate a random time between 12 and 15 minutes
const getRandomTime = (): number => {
  return Math.floor(Math.random() * (15 - 12 + 1)) + 12;
};

const phaseOrder: UserPhaseEnum[] = ["ASSESSMENT", "CONSULTATION", "TREATMENT"];

export default function SignedIn() {
  const { gadgetConfig, user: signedUser } =
    useOutletContext<AuthOutletContext>();
  const userId = signedUser?.id;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [boxes, setBoxes] = useState<BABYLON.Mesh[]>([]);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [selectedTimelineIndex, setSelectedTimelineIndex] = useState<number>(0);

  const [{ data: user }] = useFindOne(api.user, userId ?? "", {
    live: true,
  });

  // Subscribe to changes in the User model, filtered by the current user
  const [{ data: currentPhaseUsers, fetching, error }] = useFindMany(api.user, {
    filter: {
      phase: { equals: user?.phase }, // Filter by the current user's ID
      id: { notEquals: null }, // Exclude the current user
    },
    sort: {
      phasePosition: "Ascending", // Sort by phasePosition in ascending order
    },
    live: true, // Enable subscription
  });

  console.log(currentPhaseUsers);

  useEffect(() => {
    // Calculate estimated time when currentPhaseUsers or user changes
    if (currentPhaseUsers && user) {
      const userIndex = currentPhaseUsers.findIndex(
        (phaseUser) => phaseUser.id === user.id
      );
      if (userIndex > 0) {
        let totalTime = 0;
        for (let i = 0; i < userIndex; i++) {
          totalTime += getRandomTime();
        }
        setEstimatedTime(totalTime);
      } else {
        setEstimatedTime(0); // Set to 0 if the user is in the first position
      }
    }
  }, [currentPhaseUsers, user]);

  useEffect(() => {
    // Make sure the canvas is set up after the component has mounted
    if (canvasRef.current) {
      // Create Babylon.js engine and scene
      const engine = new BABYLON.Engine(canvasRef.current, true);
      const scene = new BABYLON.Scene(engine);

      // Create camera (FreeCamera for panning, not rotation)
      const camera = new BABYLON.FreeCamera(
        "camera1",
        new BABYLON.Vector3(0, 15, -10), // Position the camera above and behind the scene
        scene
      );
      camera.setTarget(BABYLON.Vector3.Zero()); // Look at the center of the scene

      // Enable panning (horizontal and vertical movement)
      camera.attachControl(canvasRef.current, true);

      // Disable rotation
      camera.inputs.removeByType("FreeCameraMouseInput");
      camera.inputs.removeByType("FreeCameraKeyboardMoveInput");
      camera.inputs.removeByType("FreeCameraTouchInput");

      // Custom panning logic
      let previousPosition: BABYLON.Vector2 | null = null;
      const panningSpeed = 0.05; // Adjust for panning speed

      const onPointerDown = (event: PointerEvent) => {
        previousPosition = new BABYLON.Vector2(event.clientX, event.clientY);
      };
      const onPointerUp = () => {
        previousPosition = null;
      };

      canvasRef.current.addEventListener("pointerdown", onPointerDown);
      canvasRef.current.addEventListener("pointerup", onPointerUp);
      canvasRef.current.addEventListener("pointerleave", onPointerUp);

      // Create a hemispheric light
      const light = new BABYLON.HemisphericLight(
        "light1",
        new BABYLON.Vector3(0, 1, 0),
        scene
      );
      light.intensity = 0.7;

      // Create a ground/platform
      const ground = BABYLON.MeshBuilder.CreateGround(
        "ground",
        { width: 30, height: 30 }, // Adjusted ground size
        scene
      );
      const groundMaterial = new BABYLON.StandardMaterial(
        "groundMaterial",
        scene
      );
      groundMaterial.diffuseColor = BABYLON.Color3.FromHexString("#B3C0C4");
      ground.material = groundMaterial;

      // Function to create a box at a specific position
      const createBox = (position: BABYLON.Vector3, uniqueId: number) => {
        // Create the main box
        const box = BABYLON.MeshBuilder.CreateBox(
          `box${uniqueId}`,
          { size: 1 },
          scene
        );
        box.position = position;
        box.position.y = 0.5; // Position above the ground
        const boxMaterial = new BABYLON.StandardMaterial(
          `boxMaterial${uniqueId}`,
          scene
        );
        // Generate deterministic colors based on ID
        const hue = ((uniqueId * 137.5) % 360) / 360; // Golden ratio approximation for even distribution
        const r = Math.sin(hue * Math.PI * 2) * 0.5 + 0.5;
        const g = Math.sin((hue + 1 / 3) * Math.PI * 2) * 0.5 + 0.5;
        const b = Math.sin((hue + 2 / 3) * Math.PI * 2) * 0.5 + 0.5;
        boxMaterial.diffuseColor = new BABYLON.Color3(r, g, b);
        box.material = boxMaterial;

        // Add a bold contour if this box represents the current user
        if (uniqueId === Number(user?.id)) {
          // Create a slightly larger wireframe box to serve as the contour
          const contour = BABYLON.MeshBuilder.CreateBox(
            `contour${uniqueId}`,
            { size: 1.1 }, // Slightly larger than the original box
            scene
          );
          // Set position to zero since we're making it a child of the box
          contour.position = BABYLON.Vector3.Zero();

          // Make it a wireframe with a bold appearance
          const contourMaterial = new BABYLON.StandardMaterial(
            `contourMaterial${uniqueId}`,
            scene
          );
          contourMaterial.wireframe = true;
          contourMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1); // White contour
          contour.material = contourMaterial;

          // Make the contour a child of the original box so they move together
          contour.parent = box;
        }

        return box;
      };

      // Create boxes in a vertical queue (top to bottom)
      const queueLength = currentPhaseUsers?.length ?? 0; // Number of boxes in the queue (now 5)

      const spacing = 1.5; // Spacing between boxes
      const newBoxes: BABYLON.Mesh[] = [];
      const startPosition = -4; // Fixed starting position for the first box
      for (let i = 0; i < queueLength; i++) {
        const id = currentPhaseUsers?.[i].id ?? "0";
        const position = new BABYLON.Vector3(0, 0, startPosition + i * spacing); // Position along the z-axis with fixed start point
        const box = createBox(position, Number(id));
        newBoxes.push(box);
      }
      setBoxes(newBoxes);

      // Set up the render loop
      engine.runRenderLoop(() => {
        scene.render();
      });

      // Resize the engine when the window is resized
      window.addEventListener("resize", () => {
        engine.resize();
      });

      // Cleanup on unmount
      return () => {
        engine.dispose();
        canvasRef.current?.removeEventListener("pointerdown", onPointerDown);
        canvasRef.current?.removeEventListener("pointerup", onPointerUp);
        canvasRef.current?.removeEventListener("pointerleave", onPointerUp);
      };
    }
  }, [currentPhaseUsers, user]);

  useEffect(() => {
    if (user?.phase) {
      setSelectedTimelineIndex(phaseOrder.indexOf(user.phase));
    }
  }, [user?.phase]);

  const handleTimelineSelect = (index: number) => {
    setSelectedTimelineIndex(index);
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-4">{user?.phase}</h1>
      <div className="grid gap-6">
        <Card
          className="p-4 flex justify-between items-center bg-[#B3C0C4] border border-black"
          style={{ borderWidth: "2px" }}
        >
          <Card
            className="p-6 h-full w-[45%] border border-[#F3A4A4] text-foreground text-5xl flex justify-center items-center"
            style={{ borderWidth: "2px" }}
          >
            {user?.phasePosition}
          </Card>
          <div className="w-[45%] flex flex-col justify-between gap-2 items-center">
            <Card className="p-2 w-full flex items-center gap-2">
              <span
                className={`h-4 w-4 rounded-full ${getPriorityColor(
                  user?.priority as UserPriorityEnum
                )}`}
              ></span>
              {user?.priority}
            </Card>
            <Card className="p-2 w-full flex items-center gap-2">
              {estimatedTime !== null && `${estimatedTime} min`}
            </Card>
          </div>
        </Card>
        <Timeline
          items={[
            { title: "ASSESSMENT", description: "Assessment" },
            { title: "CONSULTATION", description: "Consultation" },
            { title: "TREATMENT", description: "Treatment" },
          ]}
          onSelect={handleTimelineSelect}
          selectedIndex={selectedTimelineIndex}
        />
        <Card
          className="p-0 h-full rounded-md overflow-hidden border border-black"
          style={{ borderWidth: "2px" }}
        >
          <canvas ref={canvasRef} style={{ width: "100%", height: "400px" }} />
          {/* Display user data */}
          {fetching && <p>Loading users...</p>}
          {error && <p>Error: {error.message}</p>}
        </Card>
      </div>
    </div>
  );
}
