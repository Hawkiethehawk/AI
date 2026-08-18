import tempfile
import unittest
from pathlib import Path

from collector import Node, deduplicate_items_by_package, fill_missing_web_fields, find_game_category_tabs, find_node, game_section_labels, missing_ranks, next_run_name, normalize, parse_bounds, parse_detail_nodes, parse_google_play_metadata, parse_web_metadata


class CollectorTests(unittest.TestCase):
    def test_parse_bounds(self):
        self.assertEqual(parse_bounds("[10,20][110,220]"), (10, 20, 110, 220))
        self.assertIsNone(parse_bounds("bad"))

    def test_find_node_prefers_exact_match(self):
        nodes = [
            Node("More settings help", "", "", (0, 0, 100, 40)),
            Node("More settings", "", "", (0, 50, 100, 90)),
        ]
        self.assertEqual(find_node(nodes, ["More settings"]).label, "More settings")

    def test_category_filter_matches_requested_game_categories(self):
        wanted = {normalize(value) for value in ["休闲游戏", "益智", "纸牌游戏"]}
        self.assertIn(normalize("休闲游戏"), wanted)
        self.assertNotIn(normalize("动作"), wanted)

    def test_game_category_tabs_ignore_app_cards_with_matching_text(self):
        nodes = [
            Node("益智", "", "com.xiaomi.mipicks:id/tv_category", (0, 0, 100, 40)),
            Node("益智", "", "com.xiaomi.mipicks:id/tab_text_v", (0, 40, 100, 80)),
        ]
        tabs = find_game_category_tabs(nodes, ["休闲游戏", "益智", "纸牌游戏"])
        self.assertEqual([node.resource_id for node in tabs], ["com.xiaomi.mipicks:id/tab_text_v"])

    def test_game_section_labels_support_landing_page_titles(self):
        self.assertEqual(game_section_labels("休闲游戏"), ["休闲游戏", "休闲"])
        self.assertEqual(game_section_labels("益智"), ["益智"])

    def test_parse_detail_nodes(self):
        nodes = [
            Node("4.5", "", "com.xiaomi.mipicks:id/param", (0, 0, 1, 1)),
            Node("评分", "", "com.xiaomi.mipicks:id/desc", (0, 0, 1, 1)),
            Node("9K+", "", "com.xiaomi.mipicks:id/param", (0, 0, 1, 1)),
            Node("下载", "", "com.xiaomi.mipicks:id/desc", (0, 0, 1, 1)),
            Node("Example Studio", "", "com.xiaomi.mipicks:id/developer", (0, 0, 1, 1)),
        ]
        self.assertEqual(parse_detail_nodes(nodes), {"rating": "4.5", "downloads": "9K+", "developer": "Example Studio"})

    def test_parse_detail_nodes_accepts_rating_count_label(self):
        nodes = [
            Node("4.8", "", "com.xiaomi.mipicks:id/param", (0, 0, 1, 1)),
            Node("<100 评分", "", "com.xiaomi.mipicks:id/desc", (0, 0, 1, 1)),
        ]
        self.assertEqual(parse_detail_nodes(nodes)["rating"], "4.8")

    def test_parse_web_metadata(self):
        page = '<p class="app-info__developer_test"><span>Example Studio</span></p><div aria-label="Ratings:4.9"></div><div aria-label="Downloads:100K+"></div><div aria-label="Update on : 17.08.2026"></div>'
        self.assertEqual(parse_web_metadata(page), {"rating": "4.9", "downloads": "100K+", "developer": "Example Studio", "updated_at": "2026/08/17"})

    def test_parse_google_play_metadata(self):
        page = '<div class="Vbfug test"><a><span>Example Studio</span></a></div><div itemprop="starRating" aria-label="Rated 4.2 stars out of five stars"></div><div class="wVqUob"><div class="ClM7O"><div>4.2</div></div><div class="g1rdde">Reviews</div></div><div class="wVqUob"><div class="ClM7O">100M+</div><div class="g1rdde">Downloads</div></div><div class="lXlx5">Updated on</div><div class="xg1aie">Jul 30, 2026</div>'
        self.assertEqual(parse_google_play_metadata(page), {"rating": "4.2", "downloads": "100M+", "developer": "Example Studio", "updated_at": "2026/07/30"})

    def test_fill_missing_web_fields_keeps_primary_link_source(self):
        primary = {"link": "https://getapps.example", "link_source": "getapps", "rating": "4.2", "downloads": "100M+", "developer": "", "updated_at": "01.08.2026"}
        fallback = {"link": "https://play.google.example", "link_source": "gp", "rating": "4.5", "downloads": "200M+", "developer": "Example Studio", "updated_at": "02.08.2026"}
        result = fill_missing_web_fields(primary, fallback)
        self.assertEqual(result["developer"], "Example Studio")
        self.assertEqual(result["link_source"], "getapps")
        self.assertEqual(result["rating"], "4.2")

    def test_next_run_name_increments_same_day(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "rank-20260817-01.csv").touch()
            self.assertEqual(next_run_name(root, __import__("datetime").datetime(2026, 8, 17)), "rank-20260817-02")

    def test_deduplicate_items_keeps_latest_live_position(self):
        items = [
            {"rank": 8, "app_name": "Puzzle", "package_name": "example.puzzle"},
            {"rank": 9, "app_name": "Puzzle", "package_name": "example.puzzle"},
            {"rank": 10, "app_name": "Cards", "package_name": "example.cards"},
        ]
        result = deduplicate_items_by_package(items)
        self.assertEqual([(item["rank"], item["package_name"]) for item in result], [(9, "example.puzzle"), (10, "example.cards")])
        self.assertEqual(missing_ranks(result, 10), [1, 2, 3, 4, 5, 6, 7, 8])


if __name__ == "__main__":
    unittest.main()
