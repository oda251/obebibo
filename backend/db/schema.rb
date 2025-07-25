# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 9) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "addresses", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "postal_code", null: false
    t.string "prefecture", null: false
    t.string "city", null: false
    t.string "address1", null: false
    t.string "address2"
    t.string "phone", null: false
    t.boolean "is_default", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "is_default"], name: "index_addresses_on_user_id_and_is_default"
    t.index ["user_id"], name: "index_addresses_on_user_id"
  end

  create_table "admins", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "name", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_admins_on_email", unique: true
    t.index ["reset_password_token"], name: "index_admins_on_reset_password_token", unique: true
  end

  create_table "campaigns", force: :cascade do |t|
    t.bigint "company_id", null: false
    t.string "title", null: false
    t.text "description", null: false
    t.string "image_url"
    t.datetime "start_at", null: false
    t.datetime "end_at", null: false
    t.string "status", default: "draft", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id"], name: "index_campaigns_on_company_id"
    t.index ["start_at", "end_at"], name: "index_campaigns_on_start_at_and_end_at"
    t.index ["status"], name: "index_campaigns_on_status"
  end

  create_table "companies", force: :cascade do |t|
    t.string "name", null: false
    t.string "email", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "contact_name", null: false
    t.string "contact_phone", null: false
    t.string "postal_code", null: false
    t.string "prefecture", null: false
    t.string "city", null: false
    t.string "address1", null: false
    t.string "address2"
    t.string "url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_companies_on_email", unique: true
  end

  create_table "company_sns", force: :cascade do |t|
    t.bigint "company_id", null: false
    t.string "sns_type", null: false
    t.string "sns_url", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id", "sns_type"], name: "index_company_sns_on_company_id_and_sns_type", unique: true
    t.index ["company_id"], name: "index_company_sns_on_company_id"
  end

  create_table "entries", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "campaign_id", null: false
    t.string "status", default: "pending", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["campaign_id"], name: "index_entries_on_campaign_id"
    t.index ["status"], name: "index_entries_on_status"
    t.index ["user_id", "campaign_id"], name: "index_entries_on_user_id_and_campaign_id", unique: true
    t.index ["user_id"], name: "index_entries_on_user_id"
  end

  create_table "reviews", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "campaign_id", null: false
    t.integer "rating", null: false
    t.text "comment", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["campaign_id"], name: "index_reviews_on_campaign_id"
    t.index ["rating"], name: "index_reviews_on_rating"
    t.index ["user_id", "campaign_id"], name: "index_reviews_on_user_id_and_campaign_id", unique: true
    t.index ["user_id"], name: "index_reviews_on_user_id"
  end

  create_table "shipments", force: :cascade do |t|
    t.bigint "entry_id", null: false
    t.bigint "address_id", null: false
    t.datetime "shipped_at"
    t.string "status", default: "preparing", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["address_id"], name: "index_shipments_on_address_id"
    t.index ["entry_id"], name: "index_shipments_on_entry_id"
    t.index ["shipped_at"], name: "index_shipments_on_shipped_at"
    t.index ["status"], name: "index_shipments_on_status"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "name", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "addresses", "users"
  add_foreign_key "campaigns", "companies"
  add_foreign_key "company_sns", "companies"
  add_foreign_key "entries", "campaigns"
  add_foreign_key "entries", "users"
  add_foreign_key "reviews", "campaigns"
  add_foreign_key "reviews", "users"
  add_foreign_key "shipments", "addresses"
  add_foreign_key "shipments", "entries"
end
