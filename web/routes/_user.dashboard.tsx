import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { useOutletContext } from "react-router";
import type { AuthOutletContext } from "./_user";
import * as BABYLON from "babylonjs";
import { useEffect, useRef, useState } from "react";
import { useFindMany, useFindOne } from "@gadgetinc/react";
import { api } from "../api";


export default function Dashboard() {
  const { gadgetConfig, user: signedUser } =
    useOutletContext<AuthOutletContext>();
  const userId = signedUser?.id;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [boxes, setBoxes] = useState<BABYLON.Mesh[]>([]);

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
        { width: 10, height: 10 }, // Adjusted ground size
        scene
      );
      const groundMaterial = new BABYLON.StandardMaterial(
        "groundMaterial",
        scene
      );
      groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.2); // Greenish color
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

  
  
  return (
    <div className="container mx-auto p-3">
      <div className="grid gap-6">
        <h2 className="text-center text-3xl">How are you feeling today?</h2>
        <Card className="p-6">
          
        </Card>
      </div>
    </div>
  );
}
