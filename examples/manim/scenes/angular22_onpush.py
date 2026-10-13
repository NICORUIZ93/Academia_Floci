from manim import *


class Angular22OnpushScene(Scene):
    def construct(self):
        # El título sitúa el concepto que representa esta escena.
        title = Text('Angular 22: OnPush', font_size=30)
        title.scale_to_fit_width(12.5)
        title.to_edge(UP, buff=0.55)
        self.play(Write(title))

        # Las tres tarjetas separan entrada, transformación y resultado.
        labels = ['Cambio', 'Referencia / signal', 'Render']
        colors = [BLUE, YELLOW, GREEN]
        cards = VGroup()
        for index, (label, color) in enumerate(zip(labels, colors)):
            card = RoundedRectangle(
                width=3.55, height=1.55, corner_radius=0.15,
                stroke_color=color, stroke_width=3,
                fill_color=color, fill_opacity=0.18,
            )
            card.move_to(RIGHT * (index - 1) * 4.25 + DOWN * 0.1)
            text = Text(label, font_size=22).scale_to_fit_width(3.15)
            text.move_to(card)
            cards.add(VGroup(card, text))

        # Las flechas hacen explícito el flujo causal entre las etapas.
        arrows = VGroup(*[
            Arrow(
                cards[index][0].get_right(),
                cards[index + 1][0].get_left(),
                buff=0.12, stroke_width=4, max_tip_length_to_length_ratio=0.18,
            )
            for index in range(2)
        ])
        self.play(FadeIn(cards[0], shift=UP * 0.2))
        self.play(GrowArrow(arrows[0]), FadeIn(cards[1], shift=UP * 0.2))
        self.play(GrowArrow(arrows[1]), FadeIn(cards[2], shift=UP * 0.2))

        # El marco destaca el sistema completo y permite leerlo de izquierda a derecha.
        frame = SurroundingRectangle(
            VGroup(cards, arrows), color=WHITE, buff=0.35, corner_radius=0.18,
        )
        self.play(Create(frame))
        self.wait(2)
