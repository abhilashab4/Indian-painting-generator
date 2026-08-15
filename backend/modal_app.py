import io

import modal

app = modal.App("flux-indian-painting-api")


image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "torch",
        "torchvision",
        "diffusers",
        "transformers",
        "accelerate",
        "safetensors",
        "sentencepiece",
        "fastapi[standard]",
        "peft",
        "bitsandbytes",
    )
)


@app.cls(
    image=image,
    gpu="L4",
    timeout=1200,
    scaledown_window=300,
    min_containers=0,
    max_containers=1,
    secrets=[
        modal.Secret.from_name("huggingface-secret")
    ],
)
class IndianPaintingModel:


    @modal.enter()
    def load_model(self):

        import torch

        from diffusers import (
            FluxPipeline,
            BitsAndBytesConfig as DiffusersBitsAndBytesConfig,
        )

        from diffusers.quantizers import PipelineQuantizationConfig

        from transformers import (
            BitsAndBytesConfig as TransformersBitsAndBytesConfig,
        )

        print("=" * 60)
        print("LOADING 4-BIT FLUX.1-DEV")
        print("=" * 60)


        pipeline_quant_config = PipelineQuantizationConfig(
            quant_mapping={
                "transformer": DiffusersBitsAndBytesConfig(
                    load_in_4bit=True,
                    bnb_4bit_quant_type="nf4",
                    bnb_4bit_compute_dtype=torch.bfloat16,
                ),

                "text_encoder_2": TransformersBitsAndBytesConfig(
                    load_in_4bit=True,
                    bnb_4bit_quant_type="nf4",
                    bnb_4bit_compute_dtype=torch.bfloat16,
                ),
            }
        )


        self.pipe = FluxPipeline.from_pretrained(
            "black-forest-labs/FLUX.1-dev",
            quantization_config=pipeline_quant_config,
            torch_dtype=torch.bfloat16,
        )


        self.pipe.enable_model_cpu_offload()


        self.current_style = None

        print("=" * 60)
        print("4-BIT FLUX LOADED")
        print("NO LORA LOADED YET")
        print("=" * 60)


    def load_lora(self, style):

        if style not in ["kangra", "mughal"]:
            raise ValueError(
                "style must be 'kangra' or 'mughal'"
            )

        if self.current_style == style:

            print("=" * 60)
            print(f"{style.upper()} LORA ALREADY LOADED")
            print("REUSING EXISTING LORA")
            print("=" * 60)

            return


        if self.current_style is not None:

            print("=" * 60)
            print(
                f"REMOVING {self.current_style.upper()} LORA"
            )
            print("=" * 60)

            try:
                self.pipe.unload_lora_weights()
            except Exception:
                pass

            self.current_style = None


        if style == "kangra":

            print("=" * 60)
            print("LOADING KANGRA LORA")
            print("=" * 60)

            self.pipe.load_lora_weights(
                "abhilashab1/indian-painting-loras",
                weight_name="kangra_flux_lora_v1.safetensors",
                adapter_name="kangra",
            )


        elif style == "mughal":

            print("=" * 60)
            print("LOADING MUGHAL LORA")
            print("=" * 60)

            self.pipe.load_lora_weights(
                "abhilashab1/indian-painting-loras",
                weight_name="flux_mughal_lora_v2.safetensors",
                adapter_name="mughal",
            )

        self.current_style = style

        print("=" * 60)
        print(f"{style.upper()} LORA READY")
        print("=" * 60)


    @modal.method()
    def generate(
        self,
        prompt: str,
        style: str = "kangra",
        steps: int = 20,
        guidance: float = 3.5,
        width: int = 768,
        height: int = 768,
        lora_scale: float = 1.0,
    ):

        import torch

        if style not in ["kangra", "mughal"]:
            raise ValueError(
                "style must be 'kangra' or 'mughal'"
            )

        if steps < 1 or steps > 50:
            raise ValueError(
                "steps must be between 1 and 50"
            )

        if width < 256 or width > 1536:
            raise ValueError(
                "width must be between 256 and 1536"
            )

        if height < 256 or height > 1536:
            raise ValueError(
                "height must be between 256 and 1536"
            )

        if lora_scale < 0 or lora_scale > 2:
            raise ValueError(
                "lora_scale must be between 0 and 2"
            )

        print("=" * 60)
        print("IMAGE GENERATION")
        print("=" * 60)

        print(f"Style: {style}")
        print(f"Steps: {steps}")
        print(f"Resolution: {width}x{height}")
        print(f"LoRA scale: {lora_scale}")
        print(f"Prompt: {prompt}")


        self.load_lora(style)


        self.pipe.set_adapters(
            adapter_names=[style],
            adapter_weights=[lora_scale],
        )


        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        print("=" * 60)
        print("GENERATING...")
        print("=" * 60)

        result = self.pipe(
            prompt=prompt,
            num_inference_steps=steps,
            guidance_scale=guidance,
            width=width,
            height=height,
        )

        generated_image = result.images[0]


        buffer = io.BytesIO()

        generated_image.save(
            buffer,
            format="PNG",
        )

        image_bytes = buffer.getvalue()


        del result

        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        print("=" * 60)
        print("IMAGE GENERATED SUCCESSFULLY")
        print("=" * 60)

        return image_bytes


@app.function(
    image=image,
    timeout=1200,
)
@modal.fastapi_endpoint(
    method="POST"
)
def generate_image(request: dict):

    from fastapi import Response


    prompt = request.get("prompt")

    if not prompt:
        return {
            "error": "prompt is required"
        }


    style = request.get("style", "kangra",)

    steps = request.get("steps", 20,)

    guidance = request.get("guidance", 3.5,)

    width = request.get("width", 768,)

    height = request.get("height", 768,)

    lora_scale = request.get("lora_scale", 1.0,)


    if style not in ["kangra", "mughal"]:
        return {
            "error": "style must be 'kangra' or 'mughal'"
        }


    model = IndianPaintingModel()


    image_bytes = model.generate.remote(
        prompt=prompt,
        style=style,
        steps=steps,
        guidance=guidance,
        width=width,
        height=height,
        lora_scale=lora_scale,
    )


    return Response(
        content=image_bytes,
        media_type="image/png",
    )