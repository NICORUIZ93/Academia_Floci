import sys
import shutil
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))

import build_30_step_roadmaps as roadmaps


class RevisedCurriculumTests(unittest.TestCase):
    def test_inventory_has_twenty_blocks_and_fifty_three_topics(self):
        topics = [topic for block in roadmaps.REVISED_BLOCKS for topic in block.topics]
        self.assertEqual(len(roadmaps.REVISED_BLOCKS), 20)
        self.assertEqual(len(topics), 53)
        self.assertEqual(len({topic.title for topic in topics}), 53)
        self.assertTrue(all(len(roadmaps.render_steps(topic)) == 30 for topic in topics))

    def test_requested_java_spring_and_pattern_topics_are_present(self):
        topics = [topic for block in roadmaps.REVISED_BLOCKS for topic in block.topics]
        inventory = "\n".join(
            f"{topic.title}\n{topic.focus}\n{topic.practice}\n{topic.deliverable}"
            for topic in topics
        )
        for required in (
            "LAZY/EAGER", "Spring Batch", "Apache Kafka", "retry", "DLT",
            "Singleton Eager/Lazy/Synchronized/DCL/Enum", "Factory Method",
            "Abstract Factory", "Builder", "Prototype", "Adapter", "Decorator",
            "Facade", "Composite", "Proxy", "Bridge", "Observer", "Strategy",
            "Command", "Template Method", "Chain", "State", "Iterator",
            "Mediator", "Memento", "Visitor", "CQRS", "Event Sourcing",
            "Saga", "Outbox", "12-Factor", "Distributed Monolith",
        ):
            with self.subTest(required=required):
                self.assertIn(required.casefold(), inventory.casefold())

    def test_index_advertises_the_revised_curriculum_totals(self):
        index = roadmaps.render_index()
        self.assertIn("20 bloques", index)
        self.assertIn("53 temas", index)
        self.assertIn("1,590 pasos", index)

    def test_each_block_and_topic_has_an_integrative_assessment(self):
        assessment = roadmaps.render_assessments()
        self.assertEqual(assessment.count("## Bloque "), 20)
        self.assertEqual(assessment.count("### Reto "), 53)
        self.assertIn("## Proyecto final: RutaFlow", assessment)
        self.assertIn("Outbox", assessment)

    @unittest.skipUnless(shutil.which("java"), "Requiere un JDK 17 o posterior")
    def test_pattern_demos_match_their_documented_output(self):
        cases = {
            "CreationalPatternsDemo": [
                "singleton=eager,lazy-no-sync,synchronized,double-checked,enum",
                "factory=email:RF-1,sms:RF-1",
                "abstract-factory=LOCAL-RF-1,entrega-hoy;INT-RF-1,aduana-y-seguimiento",
                "builder=Ana:RF-1:2",
                "prototype=RF-2:750g",
            ],
            "StructuralPatternsDemo": [
                "adapter=LEGACY-42",
                "decorator=log[email(RF-1)]",
                "facade=validado|reserva:RF-1|aviso:RF-1",
                "composite=RF-1+RF-2+RF-3",
                "proxy=1500",
                "bridge=sms:estado=EN_CAMINO",
            ],
            "BehavioralPatternsDemo": [
                "observer=EN_CAMINO",
                "strategy=1500",
                "command=CANCELLED",
                "template=validado>db:RF-1>notificado",
                "chain=reintento",
                "state=IN_TRANSIT",
                "iterator=CREATED,IN_TRANSIT",
                "mediator=cliente:DELIVERED",
                "memento=Calle 1",
                "visitor=zona:NORTE,demora:15",
            ],
        }
        for class_name, expected in cases.items():
            with self.subTest(pattern_catalog=class_name):
                result = subprocess.run(
                    ["java", f"examples/java/patrones-rutaflow/{class_name}.java"],
                    cwd=ROOT,
                    check=True,
                    capture_output=True,
                    text=True,
                )
                self.assertEqual(result.stdout.strip().splitlines(), expected)


if __name__ == "__main__":
    unittest.main()
