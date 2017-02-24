# -*- coding: utf-8 -*-

from domainics.db import dbc, transaction
#
# @transaction
# def create_views():
#     pass
#
#     # dbc << """
#     # # CREATE OR REPLACE VIEW mp_setup_hist AS
#     # #   SELECT s.host_sn, e.part_sn
#     # #      , e.setup_date AS bgn_time
#     # #      , s.setup_date AS end_time
#     # #      , s.ex_setup_sn AS setup_sn
#     # #      , s.ex_setup_sn AS mr_order_sn
#     # #   FROM mr_setup s
#     # #     LEFT JOIN mr_setup e ON e.setup_sn=s.ex_setup_sn
#     # #   WHERE e.setup_sn IS NOT NULL
#     # #   UNION
#     # #   SELECT s.host_sn, s.part_sn
#     # #      , s.setup_date AS bgn_date
#     # #      , '2999-12-31'::TIMESTAMP AS end_time
#     # #      , s.setup_sn
#     # #      , mr_order_sn
#     # #   FROM mr_setup s WHERE
#     # #     NOT EXISTS (SELECT 1 FROM mr_setup e WHERE e.ex_setup_sn=s.setup_sn)
#     # #   ;
#     # """
#
# @transaction
# def drop_views():
#     pass
#
#     # dbc << """
#     # # DROP VIEW IF EXISTS mp_setup_hist;
#     # """
